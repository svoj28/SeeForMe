import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';

// Only Android 12 (API 32) and older beep on every listening restart.
// Android 13+ streams the microphone to the recognizer itself, with no beep.
const native =
  Platform.OS === 'android' && Platform.Version < 33 ? requireOptionalNativeModule('BeepSilencer') : null;

export const beepSilencingNeeded = native != null;

let active = false;

/**
 * Turn silencing on while the app is listening for voice commands.
 * @param {boolean} on
 * @param {boolean} appSpeaking the app's own voice plays on the media stream,
 *   so media is only muted while the app is quiet.
 */
export function setBeepSilencing(on, appSpeaking = false) {
  if (!native) return;
  try {
    if (on) {
      native.setSystemSoundsMuted(true);
      native.setMediaMuted(!appSpeaking);
    } else {
      native.restoreAll();
    }
    active = on;
  } catch (e) {
    console.warn('beep silencer failed', e);
  }
}

/** Call when the app starts or stops talking (unmute media before speech plays). */
export function onAppSpeakingForSilencer(speaking) {
  if (!native || !active) return;
  try {
    native.setMediaMuted(!speaking);
  } catch (e) {
    console.warn('beep silencer failed', e);
  }
}
