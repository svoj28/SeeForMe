package expo.modules.textlocator

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import androidx.exifinterface.media.ExifInterface
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Text recognition that also says WHERE each line of text is, so the app can
 * tell a blind user how to move the phone ("text is cut off on the right").
 *
 * Result: { width, height, lines: [{ text, block, left, top, right, bottom, angle, confidence }] }
 * with positions from 0 to 1 in the upright photo (EXIF rotation applied).
 */
class TextLocatorModule : Module() {
  private val recognizer by lazy { TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS) }

  override fun definition() = ModuleDefinition {
    Name("TextLocator")

    AsyncFunction("recognize") { uri: String, promise: Promise ->
      val bitmap = try {
        loadUpright(if (uri.startsWith("file://")) Uri.parse(uri).path ?: uri else uri)
      } catch (e: Exception) {
        promise.reject(CodedException("LOAD_FAILED", e.message ?: "Could not open the image", e))
        return@AsyncFunction
      }
      val width = bitmap.width.toDouble()
      val height = bitmap.height.toDouble()

      recognizer.process(InputImage.fromBitmap(bitmap, 0))
        .addOnSuccessListener { text ->
          val lines = text.textBlocks.flatMapIndexed { blockIndex, block ->
            block.lines.mapNotNull { line ->
              val box = line.boundingBox ?: return@mapNotNull null
              mapOf(
                "text" to line.text,
                "block" to blockIndex,
                "left" to box.left / width,
                "top" to box.top / height,
                "right" to box.right / width,
                "bottom" to box.bottom / height,
                "angle" to line.angle.toDouble(),
                "confidence" to line.confidence.toDouble(),
              )
            }
          }
          promise.resolve(mapOf("width" to bitmap.width, "height" to bitmap.height, "lines" to lines))
          bitmap.recycle()
        }
        .addOnFailureListener { e ->
          bitmap.recycle()
          promise.reject(CodedException("RECOGNITION_FAILED", e.message ?: "Text recognition failed", e))
        }
    }
  }

  /** Decodes the photo at a sensible size and turns it upright using its EXIF orientation. */
  private fun loadUpright(path: String): Bitmap {
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    BitmapFactory.decodeFile(path, bounds)
    require(bounds.outWidth > 0 && bounds.outHeight > 0) { "Not an image: $path" }

    // Keep the long side between MAX_SIDE and 2 x MAX_SIDE: sharp enough for small print, light on memory.
    var sample = 1
    while (maxOf(bounds.outWidth, bounds.outHeight) / (sample * 2) >= MAX_SIDE) sample *= 2
    val bitmap = BitmapFactory.decodeFile(path, BitmapFactory.Options().apply { inSampleSize = sample })
      ?: throw IllegalArgumentException("Could not decode: $path")

    val degrees = when (ExifInterface(path).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)) {
      ExifInterface.ORIENTATION_ROTATE_90 -> 90f
      ExifInterface.ORIENTATION_ROTATE_180 -> 180f
      ExifInterface.ORIENTATION_ROTATE_270 -> 270f
      else -> 0f
    }
    if (degrees == 0f) return bitmap
    val upright = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, Matrix().apply { postRotate(degrees) }, true)
    if (upright !== bitmap) bitmap.recycle()
    return upright
  }

  companion object {
    private const val MAX_SIDE = 2048
  }
}
