import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { File, Paths } from 'expo-file-system';

// Short beeps for the Find, Light detector, Obstacle and barcode tools.
// They are generated once as tiny WAV files in the app cache.

const SAMPLE_RATE = 22050;
const LEVELS = 8; // pitch steps: level 0 (low) … 7 (high)
const BASE_HZ = 330;

export const levelToHz = (level) => Math.round(BASE_HZ * 2 ** (Math.max(0, Math.min(LEVELS - 1, level)) / 3.5));

/** 16-bit mono PCM WAV of a sine tone with short fades (no clicks). */
export function makeWav(hz, ms, volume = 0.5) {
  const n = Math.round((SAMPLE_RATE * ms) / 1000);
  const bytes = new Uint8Array(44 + n * 2);
  const view = new DataView(bytes.buffer);
  const text = (offset, s) => [...s].forEach((ch, i) => view.setUint8(offset + i, ch.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + n * 2, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, n * 2, true);
  const fade = Math.round(SAMPLE_RATE * 0.008);
  for (let i = 0; i < n; i++) {
    const env = Math.min(1, i / fade, (n - 1 - i) / fade);
    const v = Math.sin((2 * Math.PI * hz * i) / SAMPLE_RATE) * volume * env;
    view.setInt16(44 + i * 2, Math.round(v * 32767), true);
  }
  return bytes;
}

const players = new Map();
let audioReady = null;

function prepareAudio() {
  if (!audioReady) {
    // Beeps mix with speech and play even with the silent switch on (iOS).
    audioReady = setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      allowsRecording: true, // voice commands keep the microphone open
      shouldRouteThroughEarpiece: false,
    }).catch(() => {});
  }
  return audioReady;
}

function playerFor(hz, ms) {
  const key = `${hz}-${ms}`;
  let player = players.get(key);
  if (!player) {
    const file = new File(Paths.cache, `tone-${key}.wav`);
    if (!file.exists) {
      file.create();
      file.writeSync(makeWav(hz, ms));
    }
    player = createAudioPlayer(file.uri);
    players.set(key, player);
  }
  return player;
}

/** Plays a short beep; higher `level` = higher pitch. Never throws. */
export async function beep(level, ms = 90) {
  try {
    await prepareAudio();
    const player = playerFor(levelToHz(level), ms);
    await player.seekTo(0);
    player.play();
  } catch (e) {
    console.warn('beep failed', e);
  }
}

/** Two quick rising beeps: "found it". */
export async function successChime() {
  await beep(4, 80);
  setTimeout(() => beep(7, 120), 110);
}
