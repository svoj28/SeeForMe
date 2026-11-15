import { File, Paths } from 'expo-file-system';

// Small settings file in the app's private documents folder, e.g.
// { "tutorialDone": true, "tutorialSkipped": false, "updatedAt": "2026-11-05T13:00:00.000Z" }
const FILE_NAME = 'seeforme-settings.json';
export const DEFAULTS = {
  tutorialDone: false,
  tutorialSkipped: false,
  // Speech and controls
  language: 'en', // 'en' | 'fil'
  speechRate: 1.0, // 0.5 – 2.5
  voiceCommands: true,
  touchToHear: true,
  shake: false,
  // Describe
  brief: false,
  distances: true,
  sceneGuess: true,
  photoWarnings: true,
  // Reading text
  framingTips: true,
  documentTool: true,
  // Tools (each can be turned off)
  findTool: true,
  colourTool: true,
  lightTool: true,
  productTool: true,
  productOnline: true,
  expiryTool: true,
  moneyTool: true,
  // Google Gemini API key for reading money online, entered in Settings and kept
  // only in this private file (never built into the app). '' = none.
  geminiKey: '',
  // Use Gemini (online) at all. Off = money and Describe work on the phone only.
  useGemini: true,
  // Kept for compatibility with older saved settings and voice tool selection.
  selectedTool: 'money',
  // Online model: 'gemini' or 'custom' (any OpenAI-compatible chat API that accepts images).
  onlineProvider: 'gemini',
  customBaseUrl: '', // e.g. https://api.openai.com/v1 or http://192.168.1.10:11434/v1 (Ollama)
  customModel: '', // e.g. gpt-4o-mini, llava
  customKey: '', // blank for local servers that need none
  // Own TensorFlow Lite models imported in Settings (files in documents/models).
  ownMoneyModel: true, // use the imported money classifier when online can't answer
  ownDetector: true, // use the imported object detector instead of the built-in one
  whereTool: true,
  shareTool: true,
  obstacleTool: false, // experimental: off until the user turns it on
};

const settingsFile = () => new File(Paths.document, FILE_NAME);

/** Reads settings synchronously; returns defaults if missing or unreadable. */
export function loadSettings() {
  try {
    const file = settingsFile();
    if (!file.exists) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(file.textSync()) };
  } catch (e) {
    console.warn('settings could not be read', e);
    return { ...DEFAULTS };
  }
}

/** Merges `patch` into the saved settings. Never throws. */
export function saveSettings(patch) {
  const next = { ...loadSettings(), ...patch, updatedAt: new Date().toISOString() };
  try {
    const file = settingsFile();
    if (!file.exists) file.create();
    file.writeSync(JSON.stringify(next));
  } catch (e) {
    console.warn('settings could not be saved', e);
  }
  return next;
}
