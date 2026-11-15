import ExpoModulesCore
import ImageIO
import Vision

/// Text recognition that also says WHERE each line of text is.
/// Result: { width, height, lines: [{ text, block, left, top, right, bottom, angle, confidence }] }
/// with positions from 0 to 1 in the upright photo (top-left origin).
public class TextLocatorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("TextLocator")

    AsyncFunction("recognize") { (url: URL, promise: Promise) in
      DispatchQueue.global(qos: .userInitiated).async {
        guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
              let cgImage = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
          promise.reject("LOAD_FAILED", "Could not open the image")
          return
        }

        // Photos from the camera are stored sideways with an orientation tag;
        // Vision needs that tag to read the text upright.
        let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any]
        let rawOrientation = (properties?[kCGImagePropertyOrientation] as? UInt32) ?? 1
        let orientation = CGImagePropertyOrientation(rawValue: rawOrientation) ?? .up
        let sideways: [CGImagePropertyOrientation] = [.left, .right, .leftMirrored, .rightMirrored]
        let width = sideways.contains(orientation) ? cgImage.height : cgImage.width
        let height = sideways.contains(orientation) ? cgImage.width : cgImage.height

        let request = VNRecognizeTextRequest { request, error in
          if let error = error {
            promise.reject("RECOGNITION_FAILED", error.localizedDescription)
            return
          }
          let observations = (request.results as? [VNRecognizedTextObservation]) ?? []
          var lines: [[String: Any]] = []
          for (index, observation) in observations.enumerated() {
            guard let candidate = observation.topCandidates(1).first else { continue }
            // Vision boxes are 0–1 with the origin at the BOTTOM-left; flip to top-left.
            let box = observation.boundingBox
            lines.append([
              "text": candidate.string,
              "block": index,
              "left": Double(box.minX),
              "top": Double(1 - box.maxY),
              "right": Double(box.maxX),
              "bottom": Double(1 - box.minY),
              "angle": 0.0,
              "confidence": Double(candidate.confidence),
            ])
          }
          promise.resolve(["width": width, "height": height, "lines": lines])
        }
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = true

        let handler = VNImageRequestHandler(cgImage: cgImage, orientation: orientation, options: [:])
        do {
          try handler.perform([request])
        } catch {
          promise.reject("RECOGNITION_FAILED", error.localizedDescription)
        }
      }
    }
  }
}
