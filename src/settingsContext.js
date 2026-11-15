import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { loadSettings, saveSettings } from './settings';
import { setLanguage } from './i18n';
import { setSpeechOptions, setTouchToHear } from './feedback';
import { setGeminiEnabled, setGeminiKey, setOnlineProvider } from './services/smartMoney';
import { setUseCustomDetector } from './vision/detector';

const SettingsContext = createContext(null);

function applyGlobals(settings) {
  setLanguage(settings.language);
  setGeminiKey(settings.geminiKey);
  setGeminiEnabled(settings.useGemini);
  setOnlineProvider({ provider: settings.onlineProvider, baseUrl: settings.customBaseUrl, key: settings.customKey, model: settings.customModel });
  setUseCustomDetector(settings.ownDetector);
  setSpeechOptions({ rate: settings.speechRate });
  setTouchToHear(settings.touchToHear);
}

/** Provides persistent settings to the whole app. */
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const s = loadSettings();
    applyGlobals(s);
    return s;
  });

  const latest = useRef(settings);
  latest.current = settings;

  // Applied right away (not in a state updater, which React runs later), so a
  // confirmation spoken straight after a change already uses the new language
  // and speech speed.
  const update = useCallback((patch) => {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    applyGlobals(next);
    saveSettings(patch);
    setSettings(next);
  }, []);

  const value = useMemo(() => [settings, update], [settings, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/** @returns {[object, (patch: object) => void]} */
export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}
