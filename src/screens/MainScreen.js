import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { Accelerometer } from 'expo-sensors';
import BigButton from '../components/BigButton';
import ToolsMenu from '../components/ToolsMenu';
import AboutScreen from './AboutScreen';
import SettingsScreen from './SettingsScreen';
import { colors, sizes } from '../theme';
import { buzz, isAppSpeaking, say, sayAndWait, stopSpeaking } from '../feedback';
import { getLanguage, has, recognitionLocale, t } from '../i18n';
import { useSettings } from '../settingsContext';
import { describeScene, loadDetector } from '../services/describeScene';
import { adviceSentence, joinWords, readLines, readText } from '../services/readText';
import { adviceKey, moneyGuideAdvice } from '../tools/moneyGuide';
import { locateText, textLocatorAvailable } from '../services/textLocator';
import { framingAdvice } from '../tools/framing';
import { detectWithImage } from '../vision/detector';
import { cameraFromPhoto, distancePhrase, estimateDistance } from '../vision/distance';
import { centreColour, colourName, imageStats, photoProblem } from '../vision/imageStats';
import { photoToRgbTensor } from '../vision/imageToTensor';
import { loadDepthModel, measureObstacle } from '../vision/depth';
import { beep, successChime } from '../audio/tones';
import { FIND_TARGETS, resolveTarget, spokenObject, targetName } from '../tools/findTargets';
import { daysUntil, findExpiryDate, formatDate, roughDuration } from '../tools/expiry';
import { coinBox, readCoin } from '../services/readCoin';
import { focusOn } from '../a11yFocus';
import { COIN_LOOKALIKES, readPesoMoney } from '../tools/money';
import { readMoneyCustom } from '../vision/customModels';
import { describeSceneSmart, groupPieces, readMoneySmart, totalSentimo } from '../services/smartMoney';
import { describeProduct, lookUpProduct, PRODUCT_BARCODE_TYPES, spokenBarcode } from '../tools/product';
import { whereAmI } from '../tools/where';
import { useVoiceCommands } from '../voice/useVoiceCommands';

// Gap after each live description: room for the user to speak a command.
const LIVE_PAUSE_MS = 2500;
const PRODUCT_TIMEOUT_MS = 30000;
const QUALITY_SIZE = 320;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** 3:42 PM */
const clockTime = (ms) => {
  const d = new Date(ms);
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
// Offline coin scanning: give up after this long, and speak a tip at most this often.
const COIN_SCAN_MS = 45000;
const COIN_TIP_MS = 6000;
// Money guide: stop after this long with no money in view; repeat advice this often.
const GUIDE_IDLE_MS = 60000;
const GUIDE_REPEAT_MS = 4000;

// Live mode only speaks when the scene really changes. Small distance changes
// ("about 2 meters" -> "about 2.5 meters") don't count; "less than 1 meter" does.
const liveSignature = (text) =>
  text.replace(/, (nearest |ang pinakamalapit ay )?(about [\d.]+ meters away|far away|mga [\d.]+ metro ang layo|malayo)/g, '');

// Extra tools, in menu order, with the setting that turns each one on or off.
const TOOLS = [
  { id: 'document', setting: 'documentTool' },
  { id: 'find', setting: 'findTool' },
  { id: 'colour', setting: 'colourTool' },
  { id: 'money', setting: 'moneyTool' },
  { id: 'product', setting: 'productTool' },
  { id: 'expiry', setting: 'expiryTool' },
  { id: 'light', setting: 'lightTool' },
  { id: 'where', setting: 'whereTool' },
  { id: 'share', setting: 'shareTool' },
  { id: 'obstacle', setting: 'obstacleTool' },
];

/** Scene brightness (EV at ISO 100) from photo EXIF, or null if missing. */
function exposureValue(exif) {
  if (!exif) return null;
  const n = Number(exif.FNumber ?? exif.ApertureValue);
  const time = Number(exif.ExposureTime);
  let iso = exif.ISOSpeedRatings ?? exif.PhotographicSensitivity ?? exif.ISO;
  if (Array.isArray(iso)) iso = iso[0];
  iso = Number(iso);
  if (!(n > 0 && time > 0 && iso > 0)) return null;
  return Math.log2((n * n) / time) - Math.log2(iso / 100);
}

/**
 * @param {{ greeting?: 'short' | 'skipped', onStartTutorial?: () => void }} props
 */
export default function MainScreen({ greeting = 'short', onStartTutorial }) {
  const [settings, update] = useSettings();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const cameraRef = useRef(null);
  const cameraReadyRef = useRef(false);
  const [busy, setBusy] = useState(null); // one-shot action in progress
  const busyRef = useRef(null);
  const [mode, setModeState] = useState(null); // null | 'live' | 'find' | 'light' | 'obstacle' | 'product'
  const modeRef = useRef(null);
  const modeToken = useRef(0);
  const [torch, setTorchState] = useState(false);
  const torchRef = useRef(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [overlay, setOverlay] = useState(null); // null | 'tools' | 'find' | 'settings' | 'about'
  const [status, setStatus] = useState(() => t('status.ready'));
  // Camera reading on the phone because Gemini can't answer right now (free limit used,
  // busy, no internet, no key): null (online) | { reason, retryAt: ms | null }
  const [onlineLocal, setOnlineLocalState] = useState(null);
  const onlineLocalRef = useRef(null);
  const onlineRetryTimer = useRef(null);
  // The photo being analysed, shown frozen over the camera while it is read.
  const [capturedUri, setCapturedUri] = useState(null);
  const lastResult = useRef('');
  const manualSpeech = useRef(Promise.resolve());
  const captureQueue = useRef(Promise.resolve());
  const productHandled = useRef(false);
  // Buttons that get screen-reader focus back after a menu or Settings closes.
  const settingsButtonRef = useRef(null);
  const toolButtonRef = useRef(null);

  const voice = settings.voiceCommands;
  const enabledTools = TOOLS.filter((tool) => settings[tool.setting]);
  const moneyEnabled = settings.moneyTool;
  // Keep the selected tool for voice commands and older saved settings.
  const selectedTool = enabledTools.find((tool) => tool.id === settings.selectedTool) ?? null;
  const live = mode === 'live';
  const toolMode = mode && mode !== 'live' ? mode : null;

  const announce = useCallback((text) => {
    setStatus(text);
    say(text);
  }, []);

  /** Speaks a result; Live mode waits for it to finish. */
  const tell = (text) => {
    lastResult.current = text;
    setStatus(text);
    manualSpeech.current = sayAndWait(text);
  };

  const layoutText = () =>
    fullScreen
      ? t('layout.full')
      : t('layout.normal', { torch: torchRef.current, live: modeRef.current === 'live', voice, tools: moneyEnabled, mode: toolMode && t(`mode.${toolMode}`), tool: selectedTool && t(`tool.${selectedTool.id}`), guide: selectedTool?.id === 'money' && (!toolMode || toolMode === 'moneyGuide') });

  useEffect(() => {
    announce(greeting === 'skipped' ? `${t('greet.skipped')} ${layoutText()} ${t('voice.tutorialOn')}` : t('greet.short'));
    // Load the recognition model in the background so the first tap is fast.
    loadDetector().catch(() => announce(t('model.loadError')));    return () => {
      modeRef.current = null;
    };
  }, []);

  // --- Camera helpers ---------------------------------------------------------
  // Only one photo at a time: buttons and running tools share the camera.
  const capture = (options) => {
    const shot = captureQueue.current.then(() => cameraRef.current.takePictureAsync({ shutterSound: false, ...options }));
    captureQueue.current = shot.catch(() => {});
    return shot;
  };

  const cameraIsReady = () => {
    if (cameraReadyRef.current && cameraRef.current) return true;
    buzz.error();
    announce(t('camera.starting'));
    return false;
  };

  /** 'covered' | 'dark' | 'blurry' | null (null if the warning setting is off). */
  const qualityProblem = async (photo, ignoreBlur = false) => {
    if (!settingsRef.current.photoWarnings) return null;
    const rgb = await photoToRgbTensor(photo.uri, QUALITY_SIZE);
    const problem = photoProblem(imageStats(rgb, QUALITY_SIZE, QUALITY_SIZE));
    return ignoreBlur && problem === 'blurry' ? null : problem;
  };
  const withQuality = (analyze) => async (photo) => {
    const problem = await qualityProblem(photo);
    return problem ? t(`quality.${problem}`) : analyze(photo);
  };

  const toolModeRef = () => (modeRef.current && modeRef.current !== 'live' ? modeRef.current : null);

  /**
   * Takes a photo and speaks whatever `analyze` makes of it (null = say nothing).
   * The photo is taken right away; `capturedMessage` (if given) then tells the user
   * the camera can move, since only that photo is read. While it is analysed, the
   * photo stays frozen on screen with a spinner, and a soft tick plays.
   */
  const runWithPhoto = async (kind, startMessage, photoOptions, analyze, capturedMessage) => {
    if (busyRef.current) return;
    if (toolModeRef()) {
      announce(t('mode.busy'));
      return;
    }
    if (!cameraIsReady()) return;
    busyRef.current = kind;
    setBusy(kind);
    if (startMessage) announce(startMessage);
    else beep(5, 50); // shutter tick
    let ticker = null;
    try {
      const photo = await capture(photoOptions);
      setCapturedUri(photo.uri);
      if (capturedMessage) {
        buzz.tap();
        announce(capturedMessage);
      }
      // "Still working" tick, only in silences, so slow online answers don't feel stuck.
      ticker = setInterval(() => {
        if (!isAppSpeaking()) beep(1, 40);
      }, 1500);
      const result = await analyze(photo);
      if (result) {
        buzz.success();
        tell(result);
      }
    } catch (e) {
      buzz.error();
      console.warn(`${kind} failed`, e);
      announce(t('camera.error'));
    } finally {
      clearInterval(ticker);
      setCapturedUri(null);
      busyRef.current = null;
      setBusy(null);
    }
  };

  /** Updates the "reading on the phone" indicator. */
  const setOnlineLocal = (next) => {
    onlineLocalRef.current = next;
    setOnlineLocalState(next);
    clearTimeout(onlineRetryTimer.current);
    // When Gemini's pause ends, say the next reading will try online again.
    if (next?.retryAt) {
      onlineRetryTimer.current = setTimeout(() => {
        if (onlineLocalRef.current) setOnlineLocal({ ...onlineLocalRef.current, retryAt: null });
      }, Math.max(0, next.retryAt - Date.now()) + 500);
    }
  };
  useEffect(() => () => clearTimeout(onlineRetryTimer.current), []);
  // Gemini turned off in Settings: there's no "online fallback" to show any more.
  useEffect(() => {
    if (!settings.useGemini && onlineLocalRef.current) setOnlineLocal(null);
  }, [settings.useGemini]);

  /**
   * Records how the online model (Gemini) answered, for Describe, Live and money.
   * Gemini is always tried first; when it can't answer (free limit used up, busy,
   * no internet) the phone reads instead, and once the limit resets Gemini is used
   * again automatically (smartMoney.js pauses and un-pauses each model).
   * @returns {string} a notice to say before the result ('' = none): the first
   *   switch to the phone, or Gemini answering again.
   */
  const noteOnline = (r) => {
    if (r.status !== 'offline') {
      const wasLocal = onlineLocalRef.current != null;
      if (wasLocal) setOnlineLocal(null);
      return wasLocal ? `${t('online.back')} ` : '';
    }
    if (r.reason === 'off') {
      if (onlineLocalRef.current) setOnlineLocal(null);
      return '';
    }
    const firstTime = onlineLocalRef.current == null;
    setOnlineLocal({ reason: r.reason, retryAt: r.retryAt ?? null });
    return firstTime ? `${t('online.localFallback', t(`money.why.${r.reason}`))} ` : '';
  };

  const describeOptions = (brief) => ({
    brief: brief || settingsRef.current.brief,
    scene: settingsRef.current.sceneGuess,
    distances: settingsRef.current.distances,
    lang: getLanguage(),
    checkQuality: settingsRef.current.photoWarnings,
  });

  // --- One-shot actions ----------------------------------------------------------
  const handleDescribe = () => {
    if (busyRef.current) return;
    if (toolModeRef()) stopMode(false);
    return runWithPhoto('describe', t('describe.looking'), { quality: 0.7, exif: true }, async (photo) => {
      const online = await describeSceneSmart(photo, { lang: getLanguage(), brief: settingsRef.current.brief });
      const notice = noteOnline(online);
      if (online.status === 'ok') return notice + online.text;
      if (online.status === 'unclear') return notice + t(`quality.${online.problem === 'too_dark' ? 'dark' : online.problem}`);
      const r = await describeScene(photo, describeOptions(false));
      if (r.problem) return notice + t(`quality.${r.problem}`);
      const coinLike = (r.labels ?? []).some((l) => COIN_LOOKALIKES.includes(l));
      return notice + (coinLike ? `${r.text} ${t('describe.coinHint')}` : r.text);
    });
  };
  const handleDescribeRef = useRef(handleDescribe);
  handleDescribeRef.current = handleDescribe;

  const handleRead = () =>
    runWithPhoto('read', t('read.reading'), { quality: 0.9 }, withQuality((photo) =>
      readText(photo, { torchOn: torchRef.current, tips: settingsRef.current.framingTips }),
    ));

  const handleColour = () =>
    runWithPhoto('colour', t('describe.looking'), { quality: 0.6 }, async (photo) => {
      const problem = await qualityProblem(photo, true); // blur doesn't matter for colour
      if (problem) return t(`quality.${problem}`);
      const rgb = await photoToRgbTensor(photo.uri, QUALITY_SIZE);
      return t('colour.result', colourName(centreColour(rgb, QUALITY_SIZE, QUALITY_SIZE), getLanguage()));
    });

  // Money is identified by Gemini first, with on-device fallbacks when it is unavailable.
  const smartMoneyMessage = (s) => {
    if (s.status === 'ok') return t('money.pieces', groupPieces(s.items), totalSentimo(s.items));
    switch (s.problem) {
      case 'too_dark':
        return t('quality.dark');
      case 'blurry':
        return t('quality.blurry');
      case 'no_money':
        return t('money.none');
      case 'foreign_money':
        return t('money.problem.foreign_money', s.currency);
      default:
        return has(`money.problem.${s.problem}`) ? t(`money.problem.${s.problem}`) : t('money.problem.unsure');
    }
  };

  // View money: the user holds the money to the camera and presses the button. The
  // photo is taken at that moment, then the user may move the camera: only that
  // photo is read by Gemini first, then by the phone when Gemini cannot answer.
  const handleMoney = async () => {
    // Pressed while the guide runs (it just said "ready"): stop it and take the photo.
    if (modeRef.current === 'moneyGuide') stopMode(false);
    let keepTryingCoin = false;
    let coinNotice = '';
    await runWithPhoto('money', null, { quality: 0.9 }, withQuality(async (photo) => {
      const s = await readMoneySmart(photo);
      const notice = noteOnline(s);
      if (s.status !== 'offline') return notice + smartMoneyMessage(s);
      if (settingsRef.current.ownMoneyModel) {
        try {
          const own = await readMoneyCustom(photo);
          if (own?.status === 'ok') {
            const p = own.piece;
            return notice + (p.kind === 'coin' ? t('money.coin', p.value, p.unit) : t('money.result', p.value));
          }
        } catch (e) {
          console.warn('own money model failed', e);
        }
      }
      const lines = await readLines(photo);
      const r = readPesoMoney(lines);
      if (r.kind === 'coin') return notice + t('money.coin', r.value, r.unit);
      if (r.kind === 'bill') return notice + t('money.result', r.value);
      let detections = [];
      try {
        ({ detections } = await detectWithImage(photo.uri));
      } catch (e) {
        console.warn('coin detect failed', e);
      }
      const box = coinBox(detections);
      if (r.kind === 'unsure' && !box) return notice + t('money.unsure');
      const coin = await readCoin(photo, { detections, lines });
      if (coin.kind === 'coin') return notice + t('money.coin', coin.value, coin.unit);
      if (box || coin.hint) {
        keepTryingCoin = true;
        coinNotice = notice;
        return null;
      }
      return notice + t('money.none');
    }), t('money.captured'));
    if (keepTryingCoin) handleCoinScan(coinNotice);
  };

  /** One spoken sentence for the money guide's advice. */
  const guideSentence = (a) => {
    if (!a.found) return t('guide.none');
    if (a.good) return t('guide.ready');
    if (a.farther) return t('guide.farther');
    const moves = joinWords(a.moves.map((m) => t('frame.moves')[m]));
    if (a.moves.length) return a.closer ? t('guide.moveCloser', moves) : t('guide.move', moves);
    return t('guide.closer');
  };

  // Money guide: before View money, says how to move the phone ("move left",
  // "move closer"…) until the money is in the middle and big enough, then
  // "ready, press View money". Uses only the phone's own models (text locator and
  // object detector), never Gemini, so it is free, quick and works offline.
  const handleMoneyGuide = () => {
    if (modeRef.current === 'moneyGuide') {
      stopMode();
      return;
    }
    startMode('moneyGuide', t('guide.start'), async (active) => {
      let deadline = Date.now() + GUIDE_IDLE_MS;
      let lastKey = '';
      let lastSpokenAt = 0;
      let goodCount = 0;
      while (active()) {
        const now0 = Date.now();
        if (now0 > deadline) {
          stopMode(false);
          announce(t('guide.timeout'));
          return;
        }
        if (busyRef.current || !cameraReadyRef.current) {
          await sleep(300);
          continue;
        }
        const photo = await capture({ quality: 0.4 });
        if (!active()) break;
        let key;
        let message;
        // Blur is expected while the phone moves, so only dark/covered count here.
        const problem = await qualityProblem(photo, true);
        if (problem) {
          key = `quality:${problem}`;
          message = t(`quality.${problem}`);
          goodCount = 0;
        } else {
          const [located, detected] = await Promise.all([
            textLocatorAvailable ? locateText(photo.uri).catch(() => null) : null,
            detectWithImage(photo.uri).catch(() => null),
          ]);
          if (!active()) break;
          const advice = moneyGuideAdvice({ lines: located?.lines ?? [], detections: detected?.detections ?? [] });
          key = adviceKey(advice);
          message = guideSentence(advice);
          goodCount = advice.good ? goodCount + 1 : 0;
        }
        const now = Date.now();
        if (key !== 'none') deadline = now + GUIDE_IDLE_MS; // keep going while money is in view
        if (key === 'good') {
          beep(7, 60); // high tick: "right there"
          // Twice in a row, so a lucky frame while moving doesn't count.
          if (goodCount >= 2 && lastKey !== 'good') {
            lastKey = 'good';
            lastSpokenAt = now;
            successChime();
            buzz.success();
            setStatus(message);
            say(message);
          }
          continue;
        }
        beep(key === 'none' ? 1 : 3, 50); // low tick: "not yet"
        if (isAppSpeaking()) continue;
        const repeatMs = key === 'none' ? GUIDE_REPEAT_MS * 1.5 : GUIDE_REPEAT_MS;
        if (key !== lastKey || now - lastSpokenAt > repeatMs) {
          lastKey = key;
          lastSpokenAt = now;
          setStatus(message);
          say(message);
        }
      }
    });
  };

  // Offline fallback: keeps photographing a coin until its value can be read on the
  // phone, with spoken tips (flip it, hold it closer, mind your fingers, light/glare).
  const handleCoinScan = (notice = '') =>
    startMode('coin', notice + t('coin.start'), async (active) => {
      const deadline = Date.now() + COIN_SCAN_MS;
      const tips = t('coin.tips');
      let nextTip = 0;
      let lastMessage = '';
      let lastSpokenAt = Date.now();
      while (active()) {
        if (Date.now() > deadline) {
          stopMode(false);
          announce(t('coin.giveUp'));
          return;
        }
        if (!cameraReadyRef.current) {
          await sleep(300);
          continue;
        }
        const photo = await capture({ quality: 0.9 });
        if (!active()) break;
        let message = null;
        const problem = await qualityProblem(photo);
        if (problem) {
          message = t(`quality.${problem}`);
        } else {
          let detections = [];
          try {
            ({ detections } = await detectWithImage(photo.uri));
          } catch (e) {
            console.warn('coin detect failed', e);
          }
          const r = await readCoin(photo, { detections, isActive: active });
          if (!active()) break;
          if (r.kind === 'coin') {
            successChime();
            buzz.success();
            stopMode(false);
            tell(t('money.coin', r.value, r.unit));
            return;
          }
          if (r.hint) message = t(`coin.${r.hint}`);
        }
        beep(2, 60); // low tick: "still trying"
        const now = Date.now();
        if (now - lastSpokenAt < COIN_TIP_MS || isAppSpeaking()) continue;
        // A specific problem (flip it, too dark…) wins, unless we just said it.
        if (!message || (message === lastMessage && now - lastSpokenAt < 2 * COIN_TIP_MS)) {
          message = tips[nextTip % tips.length];
          nextTip += 1;
        }
        lastMessage = message;
        lastSpokenAt = now;
        setStatus(message);
        say(message);
      }
    });

  const handleExpiry = () =>
    runWithPhoto('expiry', t('expiry.reading'), { quality: 0.9 }, withQuality(async (photo) => {
      const date = findExpiryDate(await readLines(photo));
      if (!date) return t('expiry.none');
      const months = t('months');
      const days = daysUntil(date);
      const { n, unit } = roughDuration(days);
      const unitWord = t('expiry.units')[unit][n === 1 ? 0 : 1];
      const when = days === 0 ? t('expiry.today') : days > 0 ? t('expiry.inFuture', n, unitWord) : t('expiry.inPast', n, unitWord);
      const ambiguity = date.alt ? ` ${t('expiry.ambiguous', formatDate(date, months), formatDate(date.alt, months))}` : '';
      return t('expiry.result', t(date.labelled ? 'expiry.labelExpiry' : 'expiry.labelDate'), formatDate(date, months), when) + ambiguity;
    }));

  const handleShare = () =>
    runWithPhoto('share', t('share.taking'), { quality: 0.8 }, async (photo) => {
      if (!(await Sharing.isAvailableAsync())) return t('share.unavailable');
      await sayAndWait(t('share.choose'));
      await Sharing.shareAsync(photo.uri, { mimeType: 'image/jpeg', dialogTitle: t('share.choose') });
      return null;
    });

  const handleWhere = async () => {
    if (busyRef.current) return;
    busyRef.current = 'where';
    setBusy('where');
    announce(t('where.finding'));
    try {
      const r = await whereAmI();
      if (r.status === 'ok') {
        buzz.success();
        tell(t('where.result', r.address) + (r.accuracy > 30 ? ` ${t('where.accuracy', r.accuracy)}` : ''));
      } else {
        buzz.error();
        tell(t({ 'no-permission': 'where.noPermission', failed: 'where.failed', 'no-address': 'where.noAddress' }[r.status]));
      }
    } catch (e) {
      announce(t('where.failed'));
    } finally {
      busyRef.current = null;
      setBusy(null);
    }
  };

  const handleRepeat = () => announce(lastResult.current || t('repeat.nothing'));

  const setTorch = (next) => {
    torchRef.current = next;
    setTorchState(next);
  };
  const handleTorch = () => {
    const next = !torchRef.current;
    setTorch(next);
    announce(next ? t('torch.on') : t('torch.off'));
  };

  // --- Running tools ("modes") ---------------------------------------------------
  const stopMode = (speak = true) => {
    const m = modeRef.current;
    if (!m) return false;
    modeRef.current = null;
    modeToken.current++;
    setModeState(null);
    stopSpeaking();
    if (speak) announce(m === 'live' ? t('live.off') : t('mode.stopped', t(`mode.${m}`)));
    return true;
  };

  const startMode = async (name, intro, loop) => {
    if (busyRef.current) return;
    if (modeRef.current) stopMode(false);
    if (!cameraIsReady()) return;
    const token = ++modeToken.current;
    modeRef.current = name;
    setModeState(name);
    setStatus(intro);
    await sayAndWait(intro);
    const active = () => modeRef.current === name && modeToken.current === token;
    if (!active()) return;
    try {
      await loop(active);
    } catch (e) {
      console.warn(`${name} failed`, e);
      if (active()) {
        stopMode(false);
        announce(t('camera.error'));
      }
    }
  };

  const handleLive = () => {
    if (modeRef.current === 'live') {
      stopMode();
      return;
    }
    startMode('live', t('live.on'), async (active) => {
      let lastSignature = '';
      let lastProblem = null;
      let lastOnline = ''; // Gemini's last description, so it can say "nothing changed"
      const speakResult = async (text) => {
        lastResult.current = text;
        setStatus(text);
        await sayAndWait(text);
      };
      const speakProblem = async (problem, notice) => {
        if (problem === lastProblem && !notice) return;
        lastProblem = problem;
        setStatus(t(`quality.${problem}`));
        await sayAndWait(notice + t(`quality.${problem}`));
      };
      while (active()) {
        await manualSpeech.current;
        if (!active()) break;
        if (busyRef.current || !cameraReadyRef.current) {
          await sleep(500);
          continue;
        }
        const photo = await capture({ quality: 0.5, exif: true });
        // Gemini first; when its limit is used up (or it is busy/offline) the phone
        // describes, until Gemini's pause ends and it is tried again.
        const online = await describeSceneSmart(photo, { lang: getLanguage(), brief: true, previous: lastOnline });
        if (!active()) break;
        const notice = noteOnline(online);
        if (online.status === 'ok') {
          lastProblem = null;
          if ((online.changed || notice) && !busyRef.current) {
            lastOnline = online.text;
            await speakResult(notice + online.text);
          }
        } else if (online.status === 'unclear') {
          await speakProblem(online.problem === 'too_dark' ? 'dark' : online.problem, notice);
        } else {
          lastOnline = '';
          const r = await describeScene(photo, describeOptions(true));
          if (!active()) break;
          if (r.problem) {
            await speakProblem(r.problem, notice);
          } else {
            lastProblem = null;
            const signature = liveSignature(r.text);
            if (!r.empty && (signature !== lastSignature || notice) && !busyRef.current) {
              lastSignature = signature;
              await speakResult(notice + r.text);
            } else if (notice) {
              await sayAndWait(notice);
            }
          }
        }
        await sleep(LIVE_PAUSE_MS);
      }
    });
  };

  const startFind = (target) => {
    const name = targetName(target, getLanguage());
    startMode('find', t('find.start', name), async (active) => {
      let lastKey = null;
      let lastSpokenAt = 0;
      let missingSince = Date.now();
      while (active()) {
        if (!cameraReadyRef.current) {
          await sleep(300);
          continue;
        }
        const photo = await capture({ quality: 0.3, exif: true });
        const { detections } = await detectWithImage(photo.uri);
        if (!active()) break;
        const now = Date.now();
        const matches = detections.filter((d) => target.labels.includes(d.label) && d.score >= 0.4);
        if (!matches.length) {
          if (now - missingSince > 6000 && now - lastSpokenAt > 6000 && !isAppSpeaking()) {
            lastSpokenAt = now;
            lastKey = null;
            say(t('find.notInView', name));
          }
          continue;
        }
        missingSince = now;
        const best = matches.reduce((a, b) => (b.score > a.score ? b : a));
        const offset = (best.box.left + best.box.right) / 2 - 0.5; // -0.5 (left) … 0.5 (right)
        const off = Math.abs(offset);
        beep(Math.round(7 * (1 - Math.min(1, off / 0.5)))); // higher pitch nearer the middle
        let key;
        if (off < 0.12) {
          key = 'ahead';
          buzz.tap();
        } else if (off < 0.3) key = offset < 0 ? 'slightLeft' : 'slightRight';
        else key = offset < 0 ? 'left' : 'right';
        if ((key !== lastKey || now - lastSpokenAt > 5000) && !isAppSpeaking()) {
          lastKey = key;
          lastSpokenAt = now;
          if (key === 'ahead') {
            const m = settingsRef.current.distances ? estimateDistance(best.label, best.box, cameraFromPhoto(photo)) : null;
            say(t('find.ahead', name, m != null ? distancePhrase(m, getLanguage()) : ''));
          } else say(t(`find.${key}`, name));
        }
      }
    });
  };

  const handleLight = () =>
    startMode('light', t('light.start'), async (active) => {
      let lastLevel = -1;
      while (active()) {
        if (!cameraReadyRef.current) {
          await sleep(300);
          continue;
        }
        const photo = await capture({ quality: 0.1, exif: true });
        if (!active()) break;
        let ev = exposureValue(photo.exif);
        if (ev == null) {
          // No exposure data: estimate from picture brightness (less reliable, cameras auto-brighten).
          const rgb = await photoToRgbTensor(photo.uri, 32);
          ev = (imageStats(rgb, 32, 32).mean / 255) * 14 - 1;
        }
        const level = ev < 0 ? 0 : ev < 3 ? 1 : ev < 6 ? 2 : ev < 9 ? 3 : ev < 12 ? 4 : 5;
        beep(Math.max(0, Math.min(7, Math.round(((ev + 1) / 15) * 7))), 120);
        if (level !== lastLevel && !isAppSpeaking()) {
          lastLevel = level;
          const words = t('light.level')[level];
          setStatus(words);
          say(words);
        }
        await sleep(400);
      }
    });

  const handleObstacle = () =>
    startMode('obstacle', t('obstacle.start'), async (active) => {
      try {
        await loadDepthModel();
      } catch (e) {
        stopMode(false);
        announce(t('obstacle.loadError'));
        return;
      }
      let lastLevel = 0;
      while (active()) {
        if (!cameraReadyRef.current) {
          await sleep(300);
          continue;
        }
        const photo = await capture({ quality: 0.3 });
        const { level } = await measureObstacle(photo.uri);
        if (!active()) break;
        if (level === 2) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          beep(7, 150);
        } else if (level === 1) {
          buzz.tap();
          beep(4, 90);
        }
        if (level !== lastLevel) {
          const message = level === 2 ? t('obstacle.veryNear') : level === 1 ? (lastLevel === 0 ? t('obstacle.near') : null) : t('obstacle.clear');
          if (message) announce(message);
          lastLevel = level;
        }
      }
    });

  // Guided document reading: keep telling the user how to move the phone until
  // all the text is in view and big enough (twice in a row), then take a sharp
  // photo and read it.
  const handleDocument = () => {
    if (!textLocatorAvailable) {
      handleRead(); // no position data on this platform: just read
      return;
    }
    startMode('document', t('document.start'), async (active) => {
      let lastAdvice = '';
      let lastSpokenAt = 0;
      let goodCount = 0;
      while (active()) {
        if (!cameraReadyRef.current) {
          await sleep(300);
          continue;
        }
        const photo = await capture({ quality: 0.5 });
        const { lines } = await locateText(photo.uri);
        if (!active()) break;
        const advice = framingAdvice(lines);
        const now = Date.now();
        if (!advice.found) {
          goodCount = 0;
          if (now - lastSpokenAt > 5000 && !isAppSpeaking()) {
            lastSpokenAt = now;
            lastAdvice = '';
            say(t('document.noText'));
          }
          continue;
        }
        if (advice.good) {
          goodCount += 1;
          beep(6, 60);
          if (goodCount < 2) continue;
          successChime();
          buzz.success();
          setStatus(t('document.reading'));
          await sayAndWait(t('document.reading'));
          if (!active()) break;
          const sharp = await capture({ quality: 0.95 });
          const text = await readText(sharp, { torchOn: torchRef.current, tips: true });
          if (!active()) break;
          stopMode(false);
          tell(text);
          return;
        }
        goodCount = 0;
        beep(2, 60); // low tick: "not yet"
        const sentence = adviceSentence(advice);
        if (sentence && (sentence !== lastAdvice || now - lastSpokenAt > 4000) && !isAppSpeaking()) {
          lastAdvice = sentence;
          lastSpokenAt = now;
          setStatus(sentence);
          say(sentence);
        }
      }
    });
  };

  const handleProduct = () =>
    startMode('product', t('product.start'), async (active) => {
      productHandled.current = false;
      const started = Date.now();
      while (active()) {
        if (Date.now() - started > PRODUCT_TIMEOUT_MS) {
          stopMode(false);
          buzz.error();
          announce(t('product.timeout'));
          return;
        }
        beep(1, 60); // soft tick: "still scanning"
        await sleep(1500);
      }
    });

  const onBarcode = async ({ data }) => {
    if (modeRef.current !== 'product' || productHandled.current) return;
    productHandled.current = true;
    stopMode(false);
    successChime();
    buzz.success();
    const code = String(data).replace(/\D/g, '');
    if (!settingsRef.current.productOnline) {
      tell(t('product.codeOnly', spokenBarcode(code)));
      return;
    }
    setStatus(t('product.lookingUp'));
    await sayAndWait(`${t('product.found')} ${t('product.lookingUp')}`);
    const r = await lookUpProduct(code, getLanguage());
    if (r.status === 'found') tell(t('product.result', describeProduct(r, t('product.by'))));
    else tell(t(r.status === 'not-found' ? 'product.notInDb' : 'product.offline', spokenBarcode(code)));
  };

  // --- Tools menu -------------------------------------------------------------------
  const toolActions = {
    document: handleDocument,
    find: () => setOverlay('find'),
    colour: handleColour,
    money: handleMoney,
    product: handleProduct,
    expiry: handleExpiry,
    light: handleLight,
    where: handleWhere,
    share: handleShare,
    obstacle: handleObstacle,
  };
  const runTool = (id) => {
    if (id !== 'find') setOverlay(null);
    // The picked tool stays on the main screen's tool button until another is picked.
    if (settingsRef.current.selectedTool !== id) update({ selectedTool: id });
    // Screen-reader focus lands on that tool button, ready to use it again.
    if (id !== 'find') focusOn(toolButtonRef);
    toolActions[id]();
  };
  /** Runs a tool by voice, unless it is turned off in Settings. */
  const voiceTool = (id, run) => {
    const tool = TOOLS.find((x) => x.id === id);
    if (!settingsRef.current[tool.setting]) {
      announce(t('voice.disabledTool', t(`tool.${id}`)));
      return;
    }
    setOverlay(null);
    (run ?? toolActions[id])();
  };
  // Closing a menu puts screen-reader focus back on the button that opened it.
  const closeOverlay = () => {
    setOverlay(null);
    announce(t('settings.back'));
    focusOn(toolButtonRef);
  };

  // --- Screens, full screen, help, voice --------------------------------------------
  const openSettings = () => {
    stopMode(false);
    cameraReadyRef.current = false; // the camera remounts when coming back
    setOverlay('settings');
  };

  const setFull = (next) => {
    setFullScreen(next);
    announce(next ? t('full.on') : t('full.off'));
  };

  // Android back button: close menus, then leave full screen.
  useEffect(() => {
    if (!overlay && !fullScreen) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (overlay === 'about') setOverlay('settings');
      else if (overlay) closeOverlay();
      else setFull(false);
      return true;
    });
    return () => sub.remove();
  }, [overlay, fullScreen]);

  const handleHelp = () =>
    announce(`${layoutText()} ${t('help.buttons')} ${voice ? t('help.voiceCommands') : t('voice.tutorialOff')}`);

  const handleVoiceToggle = () => {
    const next = !voice;
    update({ voiceCommands: next });
    announce(next ? `${t('voice.on')} ${t('voice.tutorialOn')}` : t('voice.off'));
  };

  const handleVoiceCommand = (command, transcript) => {
    switch (command) {
      case 'wake':
        announce(t('voice.wake'));
        break;
      case 'describe':
        handleDescribe();
        break;
      case 'read':
        handleRead();
        break;
      case 'live-on':
        if (modeRef.current !== 'live') handleLive();
        else announce(t('live.already'));
        break;
      case 'stop':
        if (!stopMode()) stopSpeaking();
        break;
      case 'repeat':
        handleRepeat();
        break;
      case 'light-on':
        if (!torchRef.current) handleTorch();
        else announce(t('torch.alreadyOn'));
        break;
      case 'light-off':
        if (torchRef.current) handleTorch();
        else announce(t('torch.alreadyOff'));
        break;
      case 'fullscreen-on':
        if (!fullScreen) setFull(true);
        else announce(t('full.alreadyOn'));
        break;
      case 'fullscreen-off':
        if (fullScreen) setFull(false);
        else announce(t('full.alreadyOff'));
        break;
      case 'layout':
        announce(layoutText());
        break;
      case 'help':
        handleHelp();
        break;
      case 'tutorial':
        stopMode(false);
        onStartTutorial?.();
        break;
      case 'settings':
        openSettings();
        break;
      case 'tools':
        setOverlay('tools');
        break;
      case 'find':
        voiceTool('find', () => {
          const target = resolveTarget(transcript);
          if (target) startFind(target);
          else {
            const word = spokenObject(transcript);
            if (word) announce(t('find.unknown', word));
            else setOverlay('find');
          }
        });
        break;
      case 'document':
      case 'colour':
      case 'product':
      case 'expiry':
      case 'where':
      case 'share':
      case 'obstacle':
        voiceTool(command);
        break;
      case 'light-detector':
        voiceTool('light');
        break;
      case 'money-guide':
        voiceTool('money', () => {
          if (modeRef.current !== 'moneyGuide') handleMoneyGuide();
          else announce(t('guide.start'));
        });
        break;
      case 'money':
        handleMoney();
        break;
      default:
        announce(t('voice.unknown'));
    }
  };

  useVoiceCommands({
    enabled: voice && overlay !== 'settings' && overlay !== 'about',
    lang: recognitionLocale(),
    onCommand: handleVoiceCommand,
    allowBareStop: () => modeRef.current != null || isAppSpeaking(),
    onUnavailable: (reason) => {
      update({ voiceCommands: false });
      announce(reason === 'permission' ? t('voice.needMic') : t('voice.unsupported'));
    },
  });

  // Shake the phone twice to describe (off by default: walking can trigger it).
  useEffect(() => {
    if (!settings.shake || overlay) return undefined;
    let peaks = [];
    let lastTrigger = 0;
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const g = Math.sqrt(x * x + y * y + z * z); // in g; 1 = gravity at rest
      if (g < 2.2) return;
      const now = Date.now();
      peaks = peaks.filter((p) => now - p < 800);
      if (!peaks.length || now - peaks[peaks.length - 1] > 150) peaks.push(now);
      if (peaks.length >= 2 && now - lastTrigger > 3000 && !busyRef.current) {
        lastTrigger = now;
        peaks = [];
        buzz.tap();
        handleDescribeRef.current();
      }
    });
    return () => sub.remove();
  }, [settings.shake, overlay]);

  // --- Other screens ---------------------------------------------------------------
  if (overlay === 'settings') {
    return (
      <SettingsScreen
        onClose={() => {
          setOverlay(null);
          announce(t('settings.back'));
          focusOn(settingsButtonRef, 600); // the main screen is drawn again first
        }}
        onStartTutorial={() => onStartTutorial?.()}
        onAbout={() => setOverlay('about')}
      />
    );
  }
  if (overlay === 'about') {
    return <AboutScreen onClose={() => setOverlay('settings')} />;
  }

  // --- Main screen -------------------------------------------------------------------
  const moneyBadgeText =
    onlineLocal && t('online.badge', t(`money.why.${onlineLocal.reason}`), onlineLocal.retryAt ? clockTime(onlineLocal.retryAt) : null);
  const statusLine = (
    <View style={[styles.statusOverlay, !fullScreen && styles.statusNormalOverlay]}>
      {/* No live region: every message is already spoken (with TalkBack on, through
          TalkBack itself), so a live region made each one be read twice. */}
      <Text
        style={styles.status}
        accessibilityRole="text"
        accessibilityLabel={t('status.label', status)}
        numberOfLines={4}
        adjustsFontSizeToFit
      >
        {status}
      </Text>
      {moneyBadgeText ? (
        <Text style={styles.moneyBadge} accessibilityRole="text" numberOfLines={3}>
          {moneyBadgeText}
        </Text>
      ) : null}
    </View>
  );

  const stopToolButton = toolMode && (
    <BigButton
      label={t('btn.stopMode', t(`mode.${toolMode}`))}
      hint={t('hint.stopMode')}
      color={colors.secondary}
      onPress={() => stopMode()}
      style={fullScreen ? styles.stopOverlay : styles.toolButton}
    />
  );

  const moneyBusy = busy === 'money';
  const moneyButton = moneyEnabled && (
    <BigButton
      ref={toolButtonRef}
      label={moneyBusy ? t('btn.readingMoney') : t('tool.money')}
      hint={t('tool.money.hint')}
      color={colors.tool}
      loading={moneyBusy}
      disabled={busy !== null}
      onPress={() => runTool('money')}
      style={styles.actionButton}
    />
  );

  const menuOpen = overlay === 'tools' || overlay === 'find';

  return (
    <SafeAreaView style={[styles.container, fullScreen && styles.containerFull]}>
      <StatusBar hidden={fullScreen} style="light" />

      {/* While a menu is open, screen readers only see the menu.
          VoiceOver shortcuts: two-finger double tap (magic tap) = Describe;
          two-finger scrub (escape) = stop the running tool, or leave full screen. */}
      <View
        style={styles.main}
        accessibilityElementsHidden={menuOpen}
        importantForAccessibility={menuOpen ? 'no-hide-descendants' : 'auto'}
        onMagicTap={() => handleDescribeRef.current()}
        onAccessibilityEscape={() => {
          if (!stopMode() && fullScreen) setFull(false);
        }}
      >
        {/* Help sits at the top-left, the first place a screen reader lands. */}
        {!fullScreen && (
          <View style={styles.topRow}>
            <BigButton label={t('btn.help')} hint={t('hint.help')} color={colors.accent} onPress={handleHelp} style={styles.topButton} />
            <BigButton label={t('btn.voice', voice)} hint={t('hint.voice', voice)} color={colors.accent} selected={voice} onPress={handleVoiceToggle} style={styles.topButton} />
            <BigButton ref={settingsButtonRef} label={t('btn.settings')} hint={t('hint.settings')} color={colors.accent} onPress={openSettings} style={styles.topButton} />
          </View>
        )}

        {/* Camera area. The picture is for sighted helpers, so screen readers skip
            it; the buttons on top of it stay reachable. The CameraView keeps the
            same place in the tree in both views, so the camera doesn't restart. */}
        <View style={fullScreen ? styles.previewFull : styles.preview}>
          <View style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
              enableTorch={torch}
              animateShutter={false}
              barcodeScannerSettings={mode === 'product' ? { barcodeTypes: PRODUCT_BARCODE_TYPES } : undefined}
              onBarcodeScanned={mode === 'product' ? onBarcode : undefined}
              onCameraReady={() => {
                cameraReadyRef.current = true;
              }}
              onMountError={() => announce(t('camera.mountError'))}
            />
          </View>

          {/* The photo being read, frozen on screen with a spinner: moving the phone
              now doesn't change the answer. Spoken messages already cover it. */}
          {capturedUri && (
            <View style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Image source={{ uri: capturedUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <View style={styles.readingBadge}>
                <ActivityIndicator size="large" color={colors.text} />
                <Text style={styles.readingText}>{t('preview.reading')}</Text>
              </View>
            </View>
          )}

          {statusLine}

          <BigButton
            label={fullScreen ? t('btn.exitFull') : t('btn.fullScreen')}
            hint={t('hint.fullScreen', fullScreen)}
            color={colors.secondary}
            selected={fullScreen}
            onPress={() => setFull(!fullScreen)}
            style={fullScreen ? styles.exitFullButton : styles.fullButton}
          />

          {fullScreen && stopToolButton}
        </View>

        {!fullScreen && (
          <View style={styles.row}>
            <BigButton label={t('btn.repeat')} hint={t('hint.repeat')} onPress={handleRepeat} style={styles.compact} />
            <BigButton label={t('btn.light', torch)} hint={t('hint.light', torch)} selected={torch} onPress={handleTorch} style={styles.compact} />
            <BigButton label={t('btn.live', live)} hint={t('hint.live', live)} selected={live} onPress={handleLive} style={styles.compact} />
          </View>
        )}

        {!fullScreen && (
          <View style={styles.readRow}>
            <BigButton
              label={busy === 'read' ? t('btn.reading') : t('btn.readText')}
              hint={t('hint.readText')}
              color={colors.read}
              loading={busy === 'read'}
              disabled={busy !== null}
              onPress={handleRead}
              style={styles.actionButton}
            />
            {moneyButton}
          </View>
        )}

        {/* While a tool runs, its Stop button takes the tool button's place. */}
        {!fullScreen && stopToolButton}

      </View>

      {overlay === 'tools' && (
        <ToolsMenu
          title={t('tools.title')}
          intro={enabledTools.length ? t('tools.opened', enabledTools.map((x) => t(`tool.${x.id}`))) : t('tools.none')}
          items={enabledTools.map((x) => ({ id: x.id, label: t(`tool.${x.id}`), hint: t(`tool.${x.id}.hint`) }))}
          selectedId={selectedTool?.id}
          onPick={runTool}
          onClose={closeOverlay}
        />
      )}
      {overlay === 'find' && (
        <ToolsMenu
          title={t('find.pickTitle')}
          intro={t('find.pickOpened', FIND_TARGETS.map((x) => targetName(x, getLanguage())))}
          items={FIND_TARGETS.map((x) => ({ id: x.id, label: targetName(x, getLanguage()) }))}
          onPick={(id) => {
            setOverlay(null);
            startFind(FIND_TARGETS.find((x) => x.id === id));
          }}
          onClose={closeOverlay}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: sizes.gap,
  },
  containerFull: {
    padding: 0,
  },
  main: {
    flex: 1,
    gap: sizes.gap,
  },
  topRow: {
    flexDirection: 'row',
    gap: sizes.gap,
    minHeight: 56,
  },
  topButton: {
    minHeight: 56,
    padding: 6,
  },
  // A big picture helps sighted helpers and low-vision users aim; the buttons
  // below keep large, easy-to-hit targets (at least 72 points tall).
  preview: {
    flex: 4,
    borderRadius: sizes.radius,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
  previewFull: {
    flex: 1,
  },
  fullButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    flex: 0,
    minHeight: 64,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  exitFullButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 190,
    flex: 0,
    minHeight: 96,
    paddingHorizontal: 12,
  },
  status: {
    color: colors.text,
    fontSize: sizes.statusText,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 8,
    minHeight: 72,
  },
  moneyBadge: {
    alignSelf: 'center',
    marginTop: 6,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.warning,
    color: colors.onButton,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 214, // leave room for the Exit button (190 wide + gaps)
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: sizes.radius,
    padding: 10,
  },
  statusNormalOverlay: {
    right: 12,
  },
  stopOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    flex: 0,
    minHeight: 120,
  },
  readingBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '35%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: sizes.radius,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  readingText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  compact: {
    minHeight: 72,
    paddingVertical: 8,
  },
  row: {
    flex: 0.7,
    flexDirection: 'row',
    gap: sizes.gap,
  },
  readRow: {
    flex: 0.9,
    flexDirection: 'row',
    gap: sizes.gap,
  },
  actionButton: {
    minHeight: 104,
    paddingVertical: 12,
  },
  toolButton: {
    flex: 0.8,
  },
});
