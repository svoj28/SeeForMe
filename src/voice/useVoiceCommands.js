import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { getAppSpeechSince, isAppSpeaking, onSpeakingChange } from '../feedback';
import { hasStopWord, hasWakeWord, parseCommand } from './commands';
import { onAppSpeakingForSilencer, setBeepSilencing } from './beepSilencer';

// How long after a bare "Hey Omni" we accept a command without the wake phrase.
const FOLLOW_UP_MS = 7000;
// Short words the app might be listening for, to help the recognizer.
const HINTS = [
  'Hey Omni', 'Omni', "what's on the camera", 'read this', 'start live', 'stop',
  'ano ang nasa camera', 'basahin', 'tigil', 'hanapin', 'magkano', 'nasaan ako', 'kulay',
];

/**
 * Listens for "Hey Omni, ..." voice commands while `enabled` is true.
 *
 * Barge-in: the microphone stays on while the app talks, so "Hey Omni, stop"
 * (or just "stop") works mid-sentence. The recognizer also hears the app's
 * own voice, so commands are only trusted when they couldn't have come from
 * it: the app's current speech never contains "Omni" (except the tutorial,
 * during which listening pauses), and a bare "stop" is ignored if the app
 * itself just said "stop". After the app finishes talking, the session is
 * restarted to flush its echo from the transcript.
 *
 * @param {{
 *   enabled: boolean,
 *   onCommand: (cmd: string) => void,
 *   onUnavailable: (reason: string) => void,
 *   allowBareStop?: () => boolean,
 *   bareCommands?: () => string[],
 * }} params
 *   bareCommands: commands accepted without "Hey Omni" while the app is quiet
 *   (e.g. "next", "skip" during the tutorial).
 */
export function useVoiceCommands({ enabled, onCommand, onUnavailable, allowBareStop, bareCommands, lang = 'en-US' }) {
  const langRef = useRef(lang);
  langRef.current = lang;
  const enabledRef = useRef(enabled);
  const runningRef = useRef(false);
  const handledRef = useRef(false);
  const sessionStart = useRef(0);
  const followUpUntil = useRef(0);
  const onDevice = useRef(true);
  const backoff = useRef(300);
  const restartTimer = useRef(null);
  const callbacks = useRef({ onCommand, onUnavailable, allowBareStop, bareCommands });
  callbacks.current = { onCommand, onUnavailable, allowBareStop, bareCommands };

  const appSpeechThisSession = () => getAppSpeechSince(sessionStart.current - 500);

  const stop = () => {
    clearTimeout(restartTimer.current);
    if (runningRef.current) {
      runningRef.current = false;
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {}
    }
  };

  const start = () => {
    clearTimeout(restartTimer.current);
    if (!enabledRef.current || runningRef.current || AppState.currentState !== 'active') return;
    // The tutorial says "Hey Omni" out loud: don't listen to that.
    if (isAppSpeaking() && hasWakeWord(getAppSpeechSince(Date.now()))) return;
    runningRef.current = true;
    handledRef.current = false;
    sessionStart.current = Date.now();
    try {
      ExpoSpeechRecognitionModule.start({
        lang: langRef.current,
        interimResults: true,
        continuous: true,
        requiresOnDeviceRecognition: onDevice.current && ExpoSpeechRecognitionModule.supportsOnDeviceRecognition(),
        addsPunctuation: false,
        contextualStrings: HINTS,
        // iOS: voiceChat turns on echo cancellation, so the user is heard over
        // the app's own voice; defaultToSpeaker keeps answers on the loudspeaker.
        iosCategory: {
          category: 'playAndRecord',
          categoryOptions: ['defaultToSpeaker', 'allowBluetooth'],
          mode: 'voiceChat',
        },
      });
    } catch (e) {
      runningRef.current = false;
      scheduleRestart(true);
    }
  };

  const scheduleRestart = (afterError = false) => {
    clearTimeout(restartTimer.current);
    if (!enabledRef.current) return;
    const delay = afterError ? backoff.current : 300;
    if (afterError) backoff.current = Math.min(backoff.current * 2, 10000);
    restartTimer.current = setTimeout(start, delay);
  };

  /** Fresh session so the app's echo is gone from the transcript. */
  const flush = () => {
    stop();
    scheduleRestart();
  };

  useSpeechRecognitionEvent('result', (event) => {
    if (handledRef.current) return;
    backoff.current = 300;
    const transcript = event.results?.[0]?.transcript ?? '';
    const speakingNow = isAppSpeaking();
    const appSpeech = appSpeechThisSession();

    // If the app said "Omni" during this session, its echo could look like a command.
    const wakeTrusted = !hasWakeWord(appSpeech);
    if (!wakeTrusted && speakingNow) {
      stop(); // pause until the tutorial is over
      return;
    }

    let command = wakeTrusted ? parseCommand(transcript) : null;
    if (!command && !speakingNow && Date.now() < followUpUntil.current) {
      command = parseCommand(transcript, { requireWake: false });
    }
    // Screen-specific words without "Hey Omni" (only while quiet, so it isn't the app's echo).
    if (!command && !speakingNow) {
      const allowed = callbacks.current.bareCommands?.() ?? [];
      const bare = allowed.length ? parseCommand(transcript, { requireWake: false }) : null;
      if (bare && allowed.includes(bare)) command = bare;
    }
    // While the app talks, extra words after "Hey Omni" are probably its own
    // voice: treat it as "Hey Omni" → stop talking and say "Yes?".
    if (command === 'unknown' && speakingNow) command = 'wake';
    // Plain "stop" (no wake word) works while the app talks or Live is on,
    // unless the app itself said a stop word this session.
    if (!command && hasStopWord(transcript) && !hasStopWord(appSpeech) && callbacks.current.allowBareStop?.()) {
      command = 'stop';
    }
    if (!command) return;
    // A bare "Hey Omni" (or something unclear) may still be followed by more
    // words, so only act on it once the recognizer finalizes the phrase.
    if ((command === 'wake' || command === 'unknown') && !event.isFinal && !speakingNow) return;

    handledRef.current = true;
    followUpUntil.current = command === 'wake' ? Date.now() + FOLLOW_UP_MS : 0;
    stop(); // fresh session (and transcript) for the next command
    callbacks.current.onCommand(command, transcript);
    scheduleRestart();
  });

  useSpeechRecognitionEvent('end', () => {
    runningRef.current = false;
    scheduleRestart();
  });

  useSpeechRecognitionEvent('error', (event) => {
    runningRef.current = false;
    switch (event.error) {
      case 'not-allowed':
        enabledRef.current = false;
        setBeepSilencing(false);
        callbacks.current.onUnavailable('permission');
        return;
      case 'language-not-supported':
      case 'service-not-allowed':
        if (onDevice.current) {
          onDevice.current = false; // on-device model missing: fall back to the phone's standard recognizer
          scheduleRestart();
          return;
        }
        enabledRef.current = false;
        setBeepSilencing(false);
        callbacks.current.onUnavailable('unsupported');
        return;
      case 'aborted':
      case 'no-speech':
      case 'speech-timeout':
        scheduleRestart();
        return;
      default:
        scheduleRestart(true);
    }
  });

  useEffect(
    () =>
      onSpeakingChange((speaking) => {
        // Media must be unmuted before the app's voice plays (Android 12 and older).
        onAppSpeakingForSilencer(speaking);
        if (speaking) {
          if (hasWakeWord(getAppSpeechSince(Date.now()))) stop(); // tutorial: pause
          else if (!runningRef.current) scheduleRestart();
        } else if (runningRef.current && appSpeechThisSession()) {
          flush(); // drop the app's echo from the transcript
        } else {
          scheduleRestart();
        }
      }),
    [],
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && enabledRef.current) {
        setBeepSilencing(true, isAppSpeaking());
        scheduleRestart();
      } else {
        stop();
        setBeepSilencing(false);
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    enabledRef.current = enabled;
    let cancelled = false;
    if (!enabled) {
      stop();
      setBeepSilencing(false);
      return undefined;
    }
    (async () => {
      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        enabledRef.current = false;
        callbacks.current.onUnavailable('unsupported');
        return;
      }
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (cancelled) return;
      if (!permission.granted) {
        enabledRef.current = false;
        callbacks.current.onUnavailable('permission');
        return;
      }
      setBeepSilencing(true, isAppSpeaking());
      start();
    })();
    return () => {
      cancelled = true;
      stop();
      setBeepSilencing(false);
    };
  }, [enabled]);
}
