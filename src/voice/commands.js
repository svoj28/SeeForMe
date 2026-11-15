// Turns what the speech recognizer heard into an app command.
// English and Filipino (and Taglish mixes) are always both understood.
//
// Wake phrase: "Hey Omni" (also "Hoy Omni", "Uy Omni"). Recognizers often
// mishear the made-up word "Omni", so a few common mishearings are accepted too.

const WAKE = new RegExp(
  [
    String.raw`\b(?:hey|hi|hello|ok|okay|yo|hoy|uy|oy)[\s,.!]+(?:omni|omnie|omny|omne|omani|amni|homni|romney|on me|ani)\b`,
    String.raw`\bomni\b`,
  ].join('|'),
  'i',
);

// Checked in order; the first match wins. Each entry: [command, pattern].
const COMMANDS = [
  ['skip', /\b(skip|laktawan)\b/], // before 'tutorial': "skip tutorial" means skip
  ['tutorial', /\btutorial\b/],
  // Anchored: "next" / "back" only as the command itself, not "what's next to me".
  ['next', /^(next|continue|go on|susunod|tuloy)\b/],
  ['back', /^(go back|back|previous|bumalik|balik|nakaraan)\b/],
  // Before 'help': "help me read this page" is the document reader, not Help.
  ['document', /\b(document|page|help me read|dokumento|pahina)\b/],
  ['help', /\b(help|instructions|what can (you|i) (do|say)|commands|tulong|tulungan)\b/],
  ['settings', /\b(settings?|setting|ayos ng app)\b/],
  ['tools', /\b(more tools|tools|iba pang (gamit|tool))\b/],
  // Before 'layout' and 'stop': "exit full screen" mentions "screen", "stop full screen" mentions "stop".
  [
    'fullscreen-off',
    /\b(exit|close|leave|stop|end|turn off|cancel|isara|alisin)\b.*\bfull ?screen\b|\bfull ?screen off\b|\b(normal|small|smaller) (view|screen|camera)\b/,
  ],
  [
    'fullscreen-on',
    /\bfull ?screen\b|\b(bigger|larger|big) (camera|picture|preview)\b|\b(camera|picture|preview) (bigger|larger)\b|\bmaximi[sz]e\b|\bpalakihin\b/,
  ],
  ['layout', /\b(screen|buttons|layout)\b/],
  // Tools, before the general patterns they overlap with:
  ['light-detector', /\b(light detector|light meter|how bright|brightness|gaano kaliwanag|liwanag)\b/],
  ['obstacle', /\b(obstacles?|harang|sagabal)\b/],
  ['where', /\b(where am i|my location|my address|nasaan ako|saan ako|lokasyon ko)\b/],
  ['expiry', /\b(expir\w*|best before|use by|petsa)\b/],
  // Before 'money': "guide me to the money" mentions money.
  ['money-guide', /\b(guide( me)?|aim|gabay|gabayan( mo)?( ako)?)\b/],
  ['money', /\b(money|bill|peso|pesos|cash|how much|magkano|pera|piso|coins?|barya|sentimo|centavos?)\b/],
  ['product', /\b(scan|barcode|product|produkto)\b/],
  ['share', /\b(share|send (this|the|a)?\s*(picture|photo)|ibahagi|ipadala|i-share)\b/],
  ['colour', /\b(colou?r|kulay)\b/],
  ['find', /\b(find|look for|where is|where's|hanapin|nasaan ang|nasaan yung|nasaan ang aking)\b/],
  // Torch
  [
    'light-on',
    /\b(turn on|switch on|on|buksan|i-on|sindihan)\b.*\b(light|flash ?light|torch|ilaw)\b|\b(light|flash ?light|torch|ilaw)\b.*\b(on|buksan)\b/,
  ],
  [
    'light-off',
    /\b(turn off|switch off|off|patayin|i-off|isara)\b.*\b(light|flash ?light|torch|ilaw)\b|\b(light|flash ?light|torch|ilaw)\b.*\b(off|patayin)\b/,
  ],
  ['live-on', /\b(start|turn on|begin|simulan|umpisahan|buksan)\b.*\blive\b|\blive (on|mode)\b|\bkeep (watching|looking|describing)\b/],
  ['stop', /\b(stop|quiet|cancel|silence|shut up|pause|be quiet|live off|tigil|itigil|hinto|ihinto|tama na|tumahimik)\b/],
  ['repeat', /\b(repeat|again|say that|ulitin|ulit|isa pa)\b/],
  ['read', /\b(read|text|written|writing|what does (it|this|that) say|sign|label|basahin|basa|nakasulat)\b/],
  [
    'describe',
    /\b(camera|see|seeing|describe|look|looking|front|around|ahead|surroundings|next to me|near me|what'?s (this|that|there|here)|what is (this|that|there|here)|nakikita|ilarawan|ano (ito|iyan|yan|iyon|yon|to)|nasa harap|paligid)\b/,
  ],
];

const STOP_WORDS = /\b(stop|quiet|shut up|enough|cancel|silence|tigil|itigil|hinto|tama na|tumahimik)\b/i;

/** True when the text contains a word that means "stop talking". */
export const hasStopWord = (text) => STOP_WORDS.test(text || '');

/** True when the text contains the wake word (so it can't be told apart from the app's own voice). */
export const hasWakeWord = (text) => WAKE.test(text || '');

/**
 * @param {string} transcript what the recognizer heard
 * @param {{ requireWake?: boolean }} [options] set requireWake to false right
 *   after the user said just "Hey Omni" and the app answered "Yes?"
 * @returns {null | string} a command id; null = no wake phrase; 'wake' = only the wake
 *   phrase so far; 'unknown' = wake phrase + something we don't understand.
 */
export function parseCommand(transcript, { requireWake = true } = {}) {
  const text = (transcript || '').toLowerCase().replace(/[’`]/g, "'");
  let rest = text;
  if (requireWake) {
    const match = WAKE.exec(text);
    if (!match) return null;
    rest = text.slice(match.index + match[0].length);
  }
  rest = rest.replace(/^[\s,.!?]+/, '').trim();
  if (!rest) return requireWake ? 'wake' : null;
  for (const [command, pattern] of COMMANDS) {
    if (pattern.test(rest)) return command;
  }
  return 'unknown';
}
