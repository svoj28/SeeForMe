import { useEffect, useRef, useState } from 'react';
import { focusOn } from '../a11yFocus';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BigButton from '../components/BigButton';
import { colors, sizes } from '../theme';
import { say } from '../feedback';
import { has, t } from '../i18n';
import { useSettings } from '../settingsContext';
import { checkCustomModel, checkGeminiKey, hasBuiltInKey } from '../services/smartMoney';
import { hasModel, importModel, removeModel, SLOTS } from '../vision/customModels';

// Each imported model slot and the setting that turns its use on or off.
const OWN_SETTING = { money: 'ownMoneyModel', detector: 'ownDetector' };

const RATES = [0.75, 1, 1.25, 1.5, 1.75, 2, 2.5];

// Every on/off setting, by section. `when` hides a row that only matters if another is on.
const SECTIONS = [
  { title: 'settings.section.speech', keys: ['voiceCommands', 'touchToHear', 'shake'] },
  { title: 'settings.section.describe', keys: ['brief', 'distances', 'sceneGuess', 'photoWarnings'] },
  { title: 'settings.section.reading', keys: ['framingTips'] },
  {
    title: 'settings.section.tools',
    keys: ['documentTool', 'findTool', 'colourTool', 'lightTool', 'productTool', { key: 'productOnline', when: 'productTool' }, 'expiryTool', 'moneyTool', 'whereTool', 'shareTool', 'obstacleTool'],
  },
];

/** Visible name above a text field, for low-vision users. Screen readers skip it:
 *  the field already speaks the same name. */
function FieldLabel({ text }) {
  return (
    <Text style={styles.fieldLabel} accessibilityElementsHidden importantForAccessibility="no">
      {text}
    </Text>
  );
}

const hintKey = (key) => `set.${key}.hint`;
const hasHint = (key) => has(hintKey(key));

/**
 * Every feature can be turned on or off here, plus speech speed and language.
 * @param {{ onClose: () => void, onStartTutorial: () => void, onAbout: () => void }} props
 */
export default function SettingsScreen({ onClose, onStartTutorial, onAbout }) {
  const [settings, update] = useSettings();

  const rows = SECTIONS.flatMap((s) =>
    s.keys.map((k) => (typeof k === 'string' ? { key: k } : k)).filter((r) => !r.when || settings[r.when]),
  );
  const hasKey = !!settings.geminiKey;
  const customSet = !!(settings.customBaseUrl && settings.customModel);
  const [models, setModels] = useState(() => Object.fromEntries(SLOTS.map((s) => [s, hasModel(s)])));
  const [importing, setImporting] = useState(null);
  // language + slower + faster + toggles + online buttons + own-model buttons + tutorial + about + back
  const onlineButtons = settings.useGemini
    ? 1 + (settings.onlineProvider === 'custom' ? (customSet ? 2 : 1) : hasKey ? 2 : 1)
    : 0;
  const keyButtons = 1 + onlineButtons + SLOTS.reduce((n, s) => n + (models[s] ? 3 : 1), 0);
  const buttonCount = 3 + rows.length + keyButtons + 3;

  const [keyDraft, setKeyDraft] = useState('');
  const [checkingKey, setCheckingKey] = useState(false);
  const [customUrl, setCustomUrl] = useState(settings.customBaseUrl);
  const [customModelDraft, setCustomModelDraft] = useState(settings.customModel);
  const [customKeyDraft, setCustomKeyDraft] = useState('');

  const switchProvider = () => {
    const next = settings.onlineProvider === 'custom' ? 'gemini' : 'custom';
    update({ onlineProvider: next });
    say(t('online.switched', t(`online.provider.${next}`)));
  };

  const saveCustom = async () => {
    if (checkingKey) return;
    const baseUrl = customUrl.trim();
    const model = customModelDraft.trim();
    if (!/^https?:\/\/\S+$/i.test(baseUrl) || !model) {
      say(t('online.incomplete'));
      return;
    }
    // A blank key field keeps the saved key (it is never shown again).
    const key = customKeyDraft.trim() || settings.customKey;
    setCheckingKey(true);
    say(t('gemini.checking'));
    try {
      const result = await checkCustomModel({ baseUrl, key, model });
      if (result === 'invalid' || result === 'notFound') {
        say(t(`online.${result}`));
        return;
      }
      update({ customBaseUrl: baseUrl, customModel: model, customKey: key });
      setCustomKeyDraft('');
      say(t(result === 'ok' ? 'online.saved' : 'online.savedUnchecked'));
    } finally {
      setCheckingKey(false);
    }
  };

  const removeCustom = () => {
    update({ customBaseUrl: '', customModel: '', customKey: '' });
    setCustomUrl('');
    setCustomModelDraft('');
    say(t('online.removed'));
  };

  const doImport = async (slot) => {
    if (importing) return;
    setImporting(slot);
    say(t('own.pick'));
    try {
      const r = await importModel(slot);
      if (r.status === 'ok') {
        setModels((m) => ({ ...m, [slot]: true }));
        update({ [OWN_SETTING[slot]]: true });
        say(t('own.imported', r.name, r.labels));
      } else if (r.status !== 'cancelled') {
        say(t(`own.error.${r.status}`, r.error));
      }
    } finally {
      setImporting(null);
    }
  };

  const doRemove = (slot) => {
    removeModel(slot);
    setModels((m) => ({ ...m, [slot]: false }));
    say(t('own.removed'));
  };

  const saveKey = async () => {
    if (checkingKey) return;
    const key = keyDraft.trim();
    if (!key) {
      say(t('gemini.empty'));
      return;
    }
    setCheckingKey(true);
    say(t('gemini.checking'));
    try {
      const result = await checkGeminiKey(key);
      if (result === 'invalid') {
        say(t('gemini.invalid'));
        return;
      }
      update({ geminiKey: key });
      setKeyDraft('');
      say(t(result === 'ok' ? 'gemini.saved' : 'gemini.savedUnchecked'));
    } finally {
      setCheckingKey(false);
    }
  };

  const removeKey = () => {
    update({ geminiKey: '' });
    say(t('gemini.removed'));
  };

  // Screen-reader focus starts at the title, the top of the list.
  const titleRef = useRef(null);
  useEffect(() => {
    say(t('settings.opened', buttonCount));
    focusOn(titleRef);
  }, []);

  const toggle = (key) => {
    const value = !settings[key];
    update({ [key]: value });
    say(t('settings.changed', t(`set.${key}`), value));
  };

  const changeRate = (direction) => {
    const i = RATES.indexOf(settings.speechRate);
    const next = RATES[Math.max(0, Math.min(RATES.length - 1, (i < 0 ? 1 : i) + direction))];
    update({ speechRate: next });
    say(t('settings.rateChanged', next));
  };

  const switchLanguage = () => {
    update({ language: settings.language === 'fil' ? 'en' : 'fil' });
    say(t('settings.languageChanged'));
  };

  return (
    <SafeAreaView style={styles.container} onAccessibilityEscape={onClose}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text ref={titleRef} style={styles.title} accessibilityRole="header">
          {t('settings.title')}
        </Text>

        <BigButton label={t('settings.language')} hint={t('settings.languageHint')} color={colors.accent} onPress={switchLanguage} style={styles.row} />

        <Text style={styles.value} accessibilityRole="text">
          {t('settings.rate', settings.speechRate)}
        </Text>
        <View style={styles.pair}>
          <BigButton label={t('settings.slower')} hint={t('settings.rate', settings.speechRate)} onPress={() => changeRate(-1)} style={styles.half} />
          <BigButton label={t('settings.faster')} hint={t('settings.rate', settings.speechRate)} onPress={() => changeRate(1)} style={styles.half} />
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.header} accessibilityRole="header">
              {t(section.title)}
            </Text>
            {section.keys
              .map((k) => (typeof k === 'string' ? { key: k } : k))
              .filter((r) => !r.when || settings[r.when])
              .map(({ key }) => (
                <BigButton
                  key={key}
                  label={t('settings.toggle', t(`set.${key}`), settings[key])}
                  hint={hasHint(key) ? t(hintKey(key)) : undefined}
                  selected={!!settings[key]}
                  color={settings[key] ? colors.secondary : colors.off}
                  onPress={() => toggle(key)}
                  style={styles.row}
                />
              ))}
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.header} accessibilityRole="header">
            {t('settings.section.gemini')}
          </Text>
          <BigButton
            label={t('settings.toggle', t('set.useGemini'), settings.useGemini)}
            hint={t('set.useGemini.hint')}
            selected={!!settings.useGemini}
            color={settings.useGemini ? colors.secondary : colors.off}
            onPress={() => toggle('useGemini')}
            style={styles.row}
          />
        </View>
        {settings.useGemini && (
          <View style={styles.section}>
            <BigButton
              label={t('online.provider', t(`online.provider.${settings.onlineProvider}`))}
              hint={t('online.providerHint')}
              color={colors.accent}
              onPress={switchProvider}
              style={styles.row}
            />
          </View>
        )}
        {settings.useGemini && settings.onlineProvider === 'custom' && (
          <View style={styles.section}>
            <Text style={styles.value} accessibilityRole="text">
              {customSet ? t('online.customSet', settings.customModel) : t('online.customMissing')}
            </Text>
            {[
              ['url', customUrl, setCustomUrl, false],
              ['model', customModelDraft, setCustomModelDraft, false],
              ['key', customKeyDraft, setCustomKeyDraft, true],
            ].map(([field, value, setValue, secret]) => (
              <View key={field}>
                <FieldLabel text={t(`online.field.${field}`)} />
                <TextInput
                value={value}
                onChangeText={setValue}
                placeholder={t(`online.field.${field}`)}
                placeholderTextColor={colors.off}
                accessibilityLabel={t(`online.field.${field}`)}
                accessibilityHint={t(`online.field.${field}.hint`)}
                secureTextEntry={secret}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                keyboardType={field === 'url' ? 'url' : 'default'}
                style={styles.input}
                />
              </View>
            ))}
            <BigButton label={t('online.save')} hint={t('online.saveHint')} color={colors.accent} onPress={saveCustom} style={styles.row} />
            {customSet && (
              <BigButton label={t('online.remove')} hint={t('online.removeHint')} color={colors.secondary} onPress={removeCustom} style={styles.row} />
            )}
          </View>
        )}
        {settings.useGemini && settings.onlineProvider !== 'custom' && (
          <View style={styles.section}>
            <Text style={styles.value} accessibilityRole="text">
              {t(hasKey ? 'gemini.keySet' : hasBuiltInKey() ? 'gemini.keyBuiltIn' : 'gemini.keyMissing')}
            </Text>
            <FieldLabel text={t('gemini.field')} />
            <TextInput
              value={keyDraft}
              onChangeText={setKeyDraft}
              placeholder={t('gemini.field')}
              placeholderTextColor={colors.off}
              accessibilityLabel={t('gemini.field')}
              accessibilityHint={t('gemini.fieldHint')}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              returnKeyType="done"
              onSubmitEditing={saveKey}
              style={styles.input}
            />
            <BigButton label={t('gemini.save')} hint={t('gemini.saveHint')} color={colors.accent} onPress={saveKey} style={styles.row} />
            {hasKey && (
              <BigButton label={t('gemini.remove')} hint={t('gemini.removeHint')} color={colors.secondary} onPress={removeKey} style={styles.row} />
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.header} accessibilityRole="header">
            {t('settings.section.ownModels')}
          </Text>
          {SLOTS.map((slot) => {
            const useKey = OWN_SETTING[slot];
            return (
              <View key={slot}>
                <Text style={styles.value} accessibilityRole="text">
                  {t(`own.${slot}.status`, models[slot])}
                </Text>
                <BigButton
                  label={importing === slot ? t('own.importing') : t(`own.${slot}.import`, models[slot])}
                  hint={t(`own.${slot}.importHint`)}
                  color={colors.accent}
                  disabled={importing !== null}
                  onPress={() => doImport(slot)}
                  style={styles.row}
                />
                {models[slot] && (
                  <>
                    <BigButton
                      label={t('settings.toggle', t(`set.${useKey}`), settings[useKey])}
                      hint={t(`set.${useKey}.hint`)}
                      selected={!!settings[useKey]}
                      color={settings[useKey] ? colors.secondary : colors.off}
                      onPress={() => toggle(useKey)}
                      style={styles.row}
                    />
                    <BigButton label={t('own.remove')} hint={t(`own.${slot}.removeHint`)} color={colors.secondary} onPress={() => doRemove(slot)} style={styles.row} />
                  </>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.header} accessibilityRole="header">
          {t('settings.section.other')}
        </Text>
        <BigButton label={t('btn.startTutorial')} hint={t('hint.startTutorial')} color={colors.accent} onPress={onStartTutorial} style={styles.row} />
        <BigButton label={t('btn.about')} hint={t('hint.about')} color={colors.accent} onPress={onAbout} style={styles.row} />
      </ScrollView>

      <BigButton label={t('btn.back')} hint={t('hint.close')} color={colors.primary} onPress={onClose} style={styles.back} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: sizes.gap,
    gap: sizes.gap,
  },
  content: {
    gap: sizes.gap,
    paddingBottom: sizes.gap * 2,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
  },
  header: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: '800',
    marginTop: sizes.gap,
  },
  value: {
    color: colors.text,
    fontSize: sizes.statusText,
    fontWeight: '700',
  },
  section: {
    gap: sizes.gap,
  },
  row: {
    flex: 0,
    minHeight: 88,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    minHeight: 88,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: sizes.radius,
    paddingHorizontal: sizes.gap * 1.5,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  pair: {
    flexDirection: 'row',
    gap: sizes.gap,
  },
  half: {
    minHeight: 88,
  },
  back: {
    flex: 0,
    minHeight: 110,
  },
});
