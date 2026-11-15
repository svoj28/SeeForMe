package expo.modules.beepsilencer

import android.content.Context
import android.content.SharedPreferences
import android.media.AudioManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * On Android 12 and older, the system speech recognizer plays a beep every
 * time listening starts or stops, and there is no API to turn it off. This
 * module mutes the audio streams that carry that beep while the app listens.
 *
 * Safety: every stream we mute is remembered in SharedPreferences, so if the
 * app is killed while muted, the next launch unmutes it again.
 */
class BeepSilencerModule : Module() {
  private val mutedStreams = mutableSetOf<Int>()

  private val context: Context?
    get() = appContext.reactContext

  private val audio: AudioManager?
    get() = context?.getSystemService(Context.AUDIO_SERVICE) as? AudioManager

  private val prefs: SharedPreferences?
    get() = context?.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  private fun saveState() {
    prefs?.edit()?.putStringSet(KEY_MUTED, mutedStreams.map { it.toString() }.toSet())?.apply()
  }

  private fun setStreamMuted(stream: Int, mute: Boolean) {
    if (mute == mutedStreams.contains(stream)) return
    try {
      audio?.adjustStreamVolume(stream, if (mute) AudioManager.ADJUST_MUTE else AudioManager.ADJUST_UNMUTE, 0)
      if (mute) mutedStreams.add(stream) else mutedStreams.remove(stream)
      saveState()
    } catch (e: SecurityException) {
      // Some phones refuse while Do Not Disturb is on. Then the beep stays; nothing breaks.
    }
  }

  private fun restoreAll() {
    mutedStreams.toList().forEach { setStreamMuted(it, false) }
  }

  override fun definition() = ModuleDefinition {
    Name("BeepSilencer")

    OnCreate {
      // Undo anything left muted by a previous run that was killed.
      val leftOver = prefs?.getStringSet(KEY_MUTED, emptySet()) ?: emptySet()
      leftOver.mapNotNull { it.toIntOrNull() }.forEach { stream ->
        try {
          audio?.adjustStreamVolume(stream, AudioManager.ADJUST_UNMUTE, 0)
        } catch (e: Exception) {}
      }
      prefs?.edit()?.remove(KEY_MUTED)?.apply()
    }

    /** Notification and system sounds, where most recognizers play the beep. */
    Function("setSystemSoundsMuted") { mute: Boolean ->
      setStreamMuted(AudioManager.STREAM_NOTIFICATION, mute)
      setStreamMuted(AudioManager.STREAM_SYSTEM, mute)
    }

    /** Media sounds. Some recognizers beep here; the app's own speech plays here too. */
    Function("setMediaMuted") { mute: Boolean ->
      setStreamMuted(AudioManager.STREAM_MUSIC, mute)
    }

    Function("restoreAll") {
      restoreAll()
    }

    OnDestroy {
      restoreAll()
    }
  }

  companion object {
    private const val PREFS = "beep_silencer"
    private const val KEY_MUTED = "muted"
  }
}
