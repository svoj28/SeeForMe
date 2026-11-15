import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Google Gemini (free tier) recognizes Philippine bills and coins from their
// whole design (portrait, colour, back-side artwork, shape), not just printed
// text, so it works where on-device OCR fails: worn or shiny coins, the back
// side, a number covered by a finger, several pieces of money at once.
//
// The user pastes their own free key in Settings (get one at
// https://aistudio.google.com/apikey); it is saved only on the phone. For local
// development a key in .env.local (EXPO_PUBLIC_GEMINI_API_KEY=...) is used when
// none was entered. Cloud builds don't see .env.local, so no key is built in.
const BUILT_IN_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
let userKey = '';
const apiKey = () => userKey || BUILT_IN_KEY;
// Best free model first; the lighter one has a bigger free quota and takes
// over when the first is busy, rate-limited or unavailable.
// Each with its own time limit: the best model is often overloaded (it can hang
// for 40+ seconds before saying so), and a blind user shouldn't wait that long,
// so it gets a short limit before the fast Flash-Lite takes over.
const MODELS = [
  { name: 'gemini-3.8-flash', timeoutMs: 8000 },
  { name: 'gemini-3.5-flash-lite', timeoutMs: 15000 },
];
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
// Big enough to see a coin's details, small enough to upload quickly on mobile data.
const UPLOAD_WIDTH = 1024;

export const BILLS = [20, 50, 100, 200, 500, 1000];
export const PESO_COINS = [1, 5, 10, 20];
export const SENTIMO_COINS = [1, 5, 25];

// Gemini is optional: the user can turn it off in Settings, and then everything
// (money and Describe) runs on the phone only.
let enabled = true;
export function setGeminiEnabled(on) {
  enabled = on !== false;
}
export const geminiEnabled = () => enabled;

// Which online model answers: Google Gemini (default) or any OpenAI-compatible
// chat API the user sets up (OpenAI, OpenRouter, Groq, Claude's OpenAI-compatible
// endpoint, or a local Ollama / LM Studio server). The model must accept images.
let provider = 'gemini';
let custom = { baseUrl: '', key: '', model: '' };
export function setOnlineProvider({ provider: p, baseUrl = '', key = '', model = '' } = {}) {
  const next = { baseUrl: baseUrl.trim(), key: key.trim(), model: model.trim() };
  const nextProvider = p === 'custom' ? 'custom' : 'gemini';
  if (nextProvider === provider && JSON.stringify(next) === JSON.stringify(custom)) return;
  provider = nextProvider;
  custom = next;
  paused.clear();
}
export const onlineProvider = () => provider;
const customReady = () => custom.baseUrl.length > 0 && custom.model.length > 0;
const activeModels = () => (provider === 'custom' ? [{ name: custom.model, timeoutMs: 25000, custom: true }] : MODELS);

export const smartMoneyAvailable = () => enabled && (provider === 'custom' ? customReady() : apiKey().length > 0);

/** "https://api.openai.com/v1" (or a full .../chat/completions URL) -> the chat URL. */
export function chatUrl(baseUrl) {
  const b = baseUrl.trim().replace(/\/+$/, '');
  return /\/chat\/completions$/.test(b) ? b : `${b}/chat/completions`;
}

/**
 * Checks an OpenAI-compatible setup with a tiny text request.
 * @returns {Promise<'ok' | 'invalid' | 'notFound' | 'network' | 'unknown'>}
 */
export async function checkCustomModel({ baseUrl, key, model }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(chatUrl(baseUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(key.trim() ? { Authorization: `Bearer ${key.trim()}` } : {}) },
      signal: controller.signal,
      body: JSON.stringify({ model: model.trim(), max_tokens: 5, messages: [{ role: 'user', content: 'Reply with OK.' }] }),
    });
    if (res.ok) return 'ok';
    if (res.status === 401 || res.status === 403) return 'invalid';
    if (res.status === 404 || res.status === 400) return 'notFound';
    return 'unknown';
  } catch {
    return 'network';
  } finally {
    clearTimeout(timer);
  }
}
/** True when the app was built with a development key (from .env.local). */
export const hasBuiltInKey = () => BUILT_IN_KEY.length > 0;

/** Uses the key entered in Settings ('' = none). A new key starts with no pauses. */
export function setGeminiKey(key) {
  const next = typeof key === 'string' ? key.trim() : '';
  if (next === userKey) return;
  userKey = next;
  paused.clear();
}

/**
 * Checks a key with Google before saving it.
 * @returns {Promise<'ok' | 'invalid' | 'network' | 'unknown'>}
 */
export async function checkGeminiKey(key) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${ENDPOINT}?pageSize=1`, {
      headers: { 'x-goog-api-key': key.trim() },
      signal: controller.signal,
    });
    if (res.ok) return 'ok';
    if (res.status === 400 || res.status === 401 || res.status === 403) return 'invalid';
    return 'unknown';
  } catch {
    return 'network';
  } finally {
    clearTimeout(timer);
  }
}

const PROMPT = `You are helping a blind person in the Philippines identify money in a photo.
Identify every Philippine peso bill and coin that is visible.

Valid bills (paper or polymer, old or new design): 20, 50, 100, 200, 500, 1000 piso.
Valid coins (New Generation series and older BSP series): 1, 5, 10, 20 piso; 1, 5, 25 sentimo.

Use everything you can see: printed or stamped numbers, words like "PISO" or "SENTIMO",
colours, portraits, shape and edge of coins, and the artwork on the back side.
Count each separate bill or coin once.

Be strict: this person relies on you for real money.
- confidence "high" only if you are certain of the value.
- If you cannot tell the value of a piece, give confidence "low" instead of guessing.
- If there is no money, return no items and problem "no_money".
- If it is money from another country, return no items, problem "foreign_money", and name the currency.
- Otherwise set problem to the main thing stopping a confident answer (too_dark, blurry, too_far,
  partly_hidden, glare), or "none".`;

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          kind: { type: 'STRING', enum: ['bill', 'coin'] },
          value: { type: 'INTEGER' },
          unit: { type: 'STRING', enum: ['piso', 'sentimo'] },
          confidence: { type: 'STRING', enum: ['high', 'medium', 'low'] },
        },
        required: ['kind', 'value', 'unit', 'confidence'],
      },
    },
    problem: {
      type: 'STRING',
      enum: ['none', 'too_dark', 'blurry', 'too_far', 'partly_hidden', 'glare', 'no_money', 'foreign_money'],
    },
    foreignCurrency: { type: 'STRING' },
  },
  required: ['items', 'problem'],
};

/** Keeps only real Philippine denominations. */
export function isValidPiece({ kind, value, unit }) {
  if (kind === 'bill') return unit === 'piso' && BILLS.includes(value);
  if (kind === 'coin') return unit === 'piso' ? PESO_COINS.includes(value) : unit === 'sentimo' && SENTIMO_COINS.includes(value);
  return false;
}

/**
 * Turns the model's JSON answer into a result we can trust.
 * @returns {{ status: 'ok', items: Array<{ kind, value, unit }> } |
 *   { status: 'unclear', problem: string, currency?: string }}
 */
export function interpretAnswer(answer) {
  const items = Array.isArray(answer?.items) ? answer.items : [];
  const sure = items.filter((i) => isValidPiece(i) && (i.confidence === 'high' || i.confidence === 'medium'));
  const problem = typeof answer?.problem === 'string' ? answer.problem : 'none';
  // Any piece we can't be sure of makes the whole answer unsure: a wrong total is worse than none.
  if (sure.length && sure.length === items.length) {
    return { status: 'ok', items: sure.map(({ kind, value, unit }) => ({ kind, value, unit })) };
  }
  if (!items.length && problem === 'foreign_money') {
    return { status: 'unclear', problem, currency: answer.foreignCurrency || '' };
  }
  if (!items.length && problem === 'no_money') return { status: 'unclear', problem };
  return { status: 'unclear', problem: problem === 'none' || problem === 'no_money' ? 'unsure' : problem };
}

async function photoBase64(uri) {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: UPLOAD_WIDTH });
  const image = await context.renderAsync();
  try {
    return (await image.saveAsync({ base64: true, format: SaveFormat.JPEG, compress: 0.85 })).base64;
  } finally {
    image.release?.();
    context.release?.();
  }
}

// --- Fallback and recovery ----------------------------------------------------------
// When a model hits its free limit (or is overloaded), it is paused so readings go
// straight to the phone instead of waiting for a request we know will fail. When the
// pause ends, the next reading tries Gemini again: that's how online reading comes
// back by itself once the quota is replenished.
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
// Daily limits reset at midnight Pacific time; rather than computing that, re-check
// at most once an hour (one quick rejected request costs nothing).
const MAX_PAUSE_MS = HOUR;
const BUSY_PAUSE_MS = 2 * MINUTE;

/** model name -> { until: ms timestamp, reason: 'limit' | 'busy' } */
const paused = new Map();

/** "37s" / "1.5s" -> milliseconds, or null. */
const parseDelay = (d) => (typeof d === 'string' && /^\d+(\.\d+)?s$/.test(d) ? Math.round(parseFloat(d) * 1000) : null);

/**
 * How long to pause after a 429. Google's error says which quota ran out
 * (per minute or per day) and usually how long to wait.
 * @param {object} error the "error" object of the JSON response
 */
export function limitPauseMs(error) {
  const details = Array.isArray(error?.details) ? error.details : [];
  const retry = details.map((d) => parseDelay(d?.retryDelay)).find((ms) => ms != null);
  const daily = details.some((d) => (d?.violations ?? []).some((v) => /PerDay/i.test(v?.quotaId ?? '')));
  const ms = retry ?? (daily ? MAX_PAUSE_MS : MINUTE);
  return Math.min(Math.max(ms, 5000), MAX_PAUSE_MS);
}

function pause(model, ms, reason) {
  paused.set(model, { until: Date.now() + ms, reason });
}

function pausedNow(model) {
  const p = paused.get(model);
  if (p && p.until > Date.now()) return p;
  paused.delete(model);
  return null;
}

/**
 * @returns {Promise<{ answer?: object, fail?: 'limit' | 'busy' | 'network' }>}
 *   fail: this model couldn't answer (and why); the next model may still try.
 */
/** Gemini's schema ('OBJECT', 'STRING'…) as standard JSON Schema, for other providers. */
function toJsonSchema(s) {
  if (Array.isArray(s)) return s.map(toJsonSchema);
  if (!s || typeof s !== 'object') return s;
  return Object.fromEntries(Object.entries(s).map(([k, v]) => [k, k === 'type' ? String(v).toLowerCase() : toJsonSchema(v)]));
}

/** The first {...} in a reply (other providers may wrap JSON in text or ``` fences). */
export function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new SyntaxError('no JSON in reply');
  return JSON.parse(text.slice(start, end + 1));
}

function request({ name: model, custom: isCustom }, base64, prompt, schema, signal) {
  if (isCustom) {
    return fetch(chatUrl(custom.baseUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(custom.key ? { Authorization: `Bearer ${custom.key}` } : {}) },
      signal,
      body: JSON.stringify({
        model,
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
              {
                type: 'text',
                text: `${prompt}\n\nReply with only a JSON object (no other text) that matches this JSON Schema:\n${JSON.stringify(toJsonSchema(schema))}`,
              },
            ],
          },
        ],
      }),
    });
  }
  return fetch(`${ENDPOINT}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey() },
    signal,
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64 } }, { text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: schema },
    }),
  });
}

/** The reply text of either API. */
function replyText(json, isCustom) {
  if (isCustom) {
    const c = json?.choices?.[0]?.message?.content;
    return Array.isArray(c) ? c.map((p) => p.text ?? '').join('') : c ?? '';
  }
  return json?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
}

async function ask(modelInfo, base64, prompt = PROMPT, schema = SCHEMA) {
  const { name: model, timeoutMs } = modelInfo;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await request(modelInfo, base64, prompt, schema, controller.signal);
    if (!res.ok) {
      console.warn(`Online model ${model} HTTP ${res.status}`);
      if (res.status === 429) {
        const body = await res.json().catch(() => null);
        pause(model, limitPauseMs(body?.error), 'limit');
        return { fail: 'limit' };
      }
      // 404 = model renamed/retired, 5xx = overloaded.
      pause(model, res.status === 404 ? MAX_PAUSE_MS : BUSY_PAUSE_MS, 'busy');
      return { fail: 'busy' };
    }
    const json = await res.json();
    return { answer: extractJson(replyText(json, modelInfo.custom)) };
  } catch (e) {
    if (e?.name === 'AbortError') {
      // Too slow: usually overloaded. Skip it for a while so readings stay quick.
      console.warn(`Online model ${model} timed out`);
      pause(model, BUSY_PAUSE_MS, 'busy');
      return { fail: 'busy' };
    }
    if (e instanceof SyntaxError) return { fail: 'busy' }; // unreadable answer
    console.warn(`Online model ${model} network error`, e);
    return { fail: 'network' }; // no internet: no point trying another model
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Identifies Philippine money in a photo with Gemini.
 * @param {{ uri: string }} photo
 * @returns {Promise<{ status: 'ok', items: Array<{ kind: 'bill' | 'coin', value: number, unit: 'piso' | 'sentimo' }> } |
 *   { status: 'unclear', problem: string, currency?: string } |
 *   { status: 'offline', reason: 'noKey' | 'network' | 'limit' | 'busy', retryAt: number | null }>}
 *   offline: Gemini can't answer now; read on the phone. retryAt: when Gemini will be
 *   tried again (null = on the next reading).
 */
export async function readMoneySmart(photo) {
  if (!enabled) return { status: 'offline', reason: 'off', retryAt: null };
  if (!smartMoneyAvailable()) return { status: 'offline', reason: 'noKey', retryAt: null };
  const fails = [];
  try {
    const base64 = await photoBase64(photo.uri);
    for (const model of activeModels()) {
      const p = pausedNow(model.name);
      if (p) {
        fails.push(p.reason);
        continue;
      }
      const { answer, fail } = await ask(model, base64);
      if (answer) return interpretAnswer(answer);
      fails.push(fail);
      if (fail === 'network') break;
    }
  } catch (e) {
    console.warn('smart money failed', e);
  }
  const reason = fails.includes('network') ? 'network' : fails.includes('limit') ? 'limit' : 'busy';
  return { status: 'offline', reason, retryAt: reason === 'network' ? null : geminiRetryAt() };
}

// --- Describe (optional, online) ------------------------------------------------------
const DESCRIBE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    description: { type: 'STRING' },
    problem: { type: 'STRING', enum: ['none', 'too_dark', 'blurry', 'covered'] },
    // Live mode only: false when the scene is the same as the previous description.
    changed: { type: 'BOOLEAN' },
  },
  required: ['description', 'problem'],
};

const describePrompt = (lang, brief, previous) => `You are the eyes of a blind person. They pointed their phone camera and asked "what is in front of me?".
Describe what the photo shows, as it will be read aloud by text-to-speech.
- Start with the most important thing: people, obstacles, doors, steps, vehicles, or the main object.
- Say where things are (left, right, ahead, near, far) and read out any large, clear text such as signs.
- ${brief ? 'One short sentence.' : 'At most three short sentences.'} No lists, no markdown, don't mention "the photo" or "the image".
- Answer in ${lang === 'fil' ? 'Filipino (Tagalog), the way people in the Philippines speak' : 'English'}.
- If the photo is unusable, set problem to too_dark, blurry or covered (lens blocked); otherwise "none".${
  previous
    ? `\n- This is a live, repeating description. Last time you said: "${previous}". Set changed to false if nothing important changed since then (same place, same main things), otherwise true.`
    : ''
}`;

/**
 * Describes the camera picture with Gemini.
 * @param {{ lang?: string, brief?: boolean, previous?: string }} options previous: the last
 *   description in Live mode, so the model can say the scene hasn't changed.
 * @returns {Promise<{ status: 'ok', text: string, changed: boolean } | { status: 'unclear', problem: 'too_dark' | 'blurry' | 'covered' } |
 *   { status: 'offline', reason: 'off' | 'noKey' | 'network' | 'limit' | 'busy', retryAt: number | null }>}
 */
export async function describeSceneSmart(photo, { lang = 'en', brief = false, previous = '' } = {}) {
  if (!enabled) return { status: 'offline', reason: 'off', retryAt: null };
  if (!smartMoneyAvailable()) return { status: 'offline', reason: 'noKey', retryAt: null };
  const fails = [];
  try {
    const base64 = await photoBase64(photo.uri);
    for (const model of activeModels()) {
      const p = pausedNow(model.name);
      if (p) {
        fails.push(p.reason);
        continue;
      }
      const { answer, fail } = await ask(model, base64, describePrompt(lang, brief, previous), DESCRIBE_SCHEMA);
      if (answer) {
        const problem = answer.problem;
        if (problem && problem !== 'none') return { status: 'unclear', problem };
        const text = typeof answer.description === 'string' ? answer.description.trim() : '';
        if (text) return { status: 'ok', text, changed: !previous || answer.changed !== false };
        fails.push('busy');
        continue;
      }
      fails.push(fail);
      if (fail === 'network') break;
    }
  } catch (e) {
    console.warn('smart describe failed', e);
  }
  const reason = fails.includes('network') ? 'network' : fails.includes('limit') ? 'limit' : 'busy';
  return { status: 'offline', reason, retryAt: reason === 'network' ? null : geminiRetryAt() };
}

/** When the first paused model becomes available again (null if none is paused). */
export function geminiRetryAt() {
  const models = activeModels();
  const times = models.map((m) => pausedNow(m.name)?.until).filter(Boolean);
  // A model that isn't paused will be tried on the next reading.
  if (times.length < models.length) return null;
  return Math.min(...times);
}

/** Total value in sentimo (100 sentimo = 1 piso). */
export const totalSentimo = (items) => items.reduce((sum, i) => sum + (i.unit === 'piso' ? i.value * 100 : i.value), 0);

/** Groups identical pieces: [{ kind, value, unit, count }], biggest first. */
export function groupPieces(items) {
  const groups = new Map();
  for (const i of items) {
    const key = `${i.kind}|${i.value}|${i.unit}`;
    const g = groups.get(key) ?? { ...i, count: 0 };
    g.count += 1;
    groups.set(key, g);
  }
  const worth = (g) => (g.unit === 'piso' ? g.value * 100 : g.value);
  return [...groups.values()].sort((a, b) => worth(b) - worth(a));
}
