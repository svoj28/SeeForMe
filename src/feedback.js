import { AccessibilityInfo } from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { speechLocale as languageForSpeech } from './i18n';

// Tracks whether VoiceOver / TalkBack is running. When it is, we route speech
// through the screen reader so the app doesn't talk over it.
let screenReaderOn = false;
AccessibilityInfo.isScreenReaderEnabled().then((on) => {
  screenReaderOn = on;
});
AccessibilityInfo.addEventListener('screenReaderChanged', (on) => {
  screenReaderOn = on;
});

export const isScreenReaderOn = () => screenReaderOn;

// --- Settings that change how the app talks ---------------------------------
let speechRate = 1.0;
let speechLanguage;
let touchToHear = true;

export function setSpeechOptions({ rate, language }) {
  if (rate) speechRate = rate;
  if (language) speechLanguage = language;
}
export const setTouchToHear = (on) => {
  touchToHear = on !== false;
};
export const isTouchToHearOn = () => touchToHear;

// --- "Is the app talking right now?" -------------------------------------
// Voice commands pause while the app speaks, so it never hears itself.
// "Quiet" is reported a moment late, so back-to-back messages don't make the
// microphone flicker on and off between them.
const QUIET_DELAY_MS = 400;
let speaking = false;
let quietTimer = null;
const speakingListeners = new Set();

function setSpeaking(value) {
  clearTimeout(quietTimer);
  if (value) {
    if (!speaking) {
      speaking = true;
      speakingListeners.forEach((fn) => fn(true));
    }
  } else {
    quietTimer = setTimeout(() => {
      speaking = false;
      speakingListeners.forEach((fn) => fn(false));
    }, QUIET_DELAY_MS);
  }
}

export const isAppSpeaking = () => speaking;

/** @returns unsubscribe function */
export function onSpeakingChange(listener) {
  speakingListeners.add(listener);
  return () => speakingListeners.delete(listener);
}

// --- Speaking --------------------------------------------------------------
let utterance = 0;
let pendingDone = null;
let currentText = '';

/** What the app is saying right now ('' when quiet). Used to ignore its own echo. */
export const getCurrentUtterance = () => currentText;

// Recent things the app said, so the voice listener can tell which words it
// heard came from the app's own loudspeaker.
const history = [];
const HISTORY_SIZE = 20;

/** @returns {string} everything the app started saying since `sinceMs` (epoch ms), joined. */
export function getAppSpeechSince(sinceMs) {
  return history
    .filter((h) => h.at >= sinceMs || h.endedAt == null || h.endedAt >= sinceMs)
    .map((h) => h.text)
    .join(' ');
}

function speak(text, onDone) {
  // Whatever was speaking before is over now: settle its waiter, even if the
  // speech engine never reports that it was stopped.
  const previous = pendingDone;
  pendingDone = null;
  Speech.stop();
  previous?.();

  const id = ++utterance;
  const entry = { text, at: Date.now(), endedAt: null };
  history.push(entry);
  if (history.length > HISTORY_SIZE) history.shift();
  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    entry.endedAt = Date.now();
    if (pendingDone === finish) pendingDone = null;
    if (id === utterance) {
      currentText = '';
      setSpeaking(false);
    }
    onDone?.();
  };
  pendingDone = finish;
  currentText = text;
  setSpeaking(true);

  if (screenReaderOn) {
    AccessibilityInfo.announceForAccessibility(text);
    // Screen readers don't report when they finish, so estimate.
    setTimeout(finish, 800 + text.split(/\s+/).length * 400);
  } else {
    Speech.speak(text, {
      rate: speechRate,
      language: speechLanguage ?? languageForSpeech(),
      onDone: finish,
      onStopped: finish,
      onError: finish,
    });
  }
}

export function say(text) {
  if (text) speak(text);
}

/** Like say(), but resolves when the speech has finished or was interrupted. */
export function sayAndWait(text) {
  return new Promise((resolve) => {
    if (!text) return resolve();
    speak(text, resolve);
  });
}

export function stopSpeaking() {
  const previous = pendingDone;
  pendingDone = null;
  utterance++;
  currentText = '';
  Speech.stop();
  previous?.();
  setSpeaking(false);
}

// Distinct vibration patterns so users can tell outcomes apart by touch.
export const buzz = {
  select: () => Haptics.selectionAsync().catch(() => {}),
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}),
};
