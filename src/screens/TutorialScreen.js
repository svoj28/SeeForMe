import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BigButton from '../components/BigButton';
import { colors, sizes } from '../theme';
import { say, sayAndWait, stopSpeaking } from '../feedback';
import { recognitionLocale, t } from '../i18n';
import { useSettings } from '../settingsContext';
import { tutorialSteps } from '../tutorial/steps';
import { useVoiceCommands } from '../voice/useVoiceCommands';

// Words that work without "Hey Omni" during the tutorial (when the app is quiet).
const TUTORIAL_WORDS = ['next', 'back', 'repeat', 'skip', 'stop'];

/**
 * Step-by-step spoken tutorial for blind users.
 * @param {{ onFinish: (how: 'done' | 'skipped') => void }} props
 */
export default function TutorialScreen({ onFinish }) {
  const [settings] = useSettings();
  const steps = tutorialSteps(settings.language);
  const total = steps.length;
  const [index, setIndex] = useState(0);
  const [voiceReady, setVoiceReady] = useState(false);
  const finished = useRef(false);
  const isLast = index === total - 1;
  const step = steps[index];
  const spokenStep = (i) => t('tut.step', i + 1, total, steps[i].title, steps[i].text);

  // Speak each step when it appears. Voice commands start after the welcome
  // has been heard, so the microphone permission prompt doesn't cut it off.
  useEffect(() => {
    let cancelled = false;
    sayAndWait(spokenStep(index)).then(() => {
      if (!cancelled) setVoiceReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [index]);

  const finish = useCallback(
    (how) => {
      if (finished.current) return;
      finished.current = true;
      stopSpeaking();
      onFinish(how);
    },
    [onFinish],
  );

  const next = () => (isLast ? finish('done') : setIndex((i) => Math.min(i + 1, total - 1)));
  const back = () => {
    if (index === 0) {
      say(t('tut.first'));
      return;
    }
    setIndex((i) => Math.max(i - 1, 0));
  };
  const repeat = () => say(spokenStep(index));
  const skip = () => finish('skipped');

  // Android back button goes to the previous step.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (index === 0) return false;
      setIndex((i) => i - 1);
      return true;
    });
    return () => sub.remove();
  }, [index]);

  useVoiceCommands({
    enabled: voiceReady && settings.voiceCommands,
    lang: recognitionLocale(),
    bareCommands: () => TUTORIAL_WORDS,
    allowBareStop: () => true,
    onCommand: (command) => {
      switch (command) {
        case 'next':
          next();
          break;
        case 'back':
          back();
          break;
        case 'repeat':
        case 'wake':
          repeat();
          break;
        case 'skip':
          skip();
          break;
        case 'stop':
          stopSpeaking();
          break;
        default:
          say(t('tut.voiceHelp'));
      }
    },
    // Buttons still work without a microphone; the voice step explains the rest.
    onUnavailable: () => {},
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip is first, where a screen reader starts, for people who want to go straight in. */}
      <BigButton label={t('btn.skipTutorial')} hint={t('hint.skipTutorial')} color={colors.accent} onPress={skip} style={styles.skip} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Text style={styles.progress}>{t('tut.progress', index + 1, total)}</Text>
        <Text style={styles.title} accessibilityRole="header">
          {step.title}
        </Text>
        <Text style={styles.text}>{step.text}</Text>
      </ScrollView>

      <View style={styles.row}>
        <BigButton label={t('btn.back')} hint={t('hint.back')} disabled={index === 0} onPress={back} />
        <BigButton label={t('btn.repeat')} hint={t('hint.repeatStep')} onPress={repeat} />
      </View>

      <BigButton
        label={isLast ? t('btn.startUsing') : t('btn.next')}
        hint={isLast ? t('hint.startUsing') : t('hint.next', index + 2, total)}
        color={colors.primary}
        onPress={next}
        style={styles.next}
      />
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
  skip: {
    flex: 0,
    minHeight: 80,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    gap: sizes.gap,
    padding: sizes.gap,
  },
  progress: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
  },
  text: {
    color: colors.text,
    fontSize: sizes.statusText,
    lineHeight: sizes.statusText * 1.4,
  },
  row: {
    flexDirection: 'row',
    gap: sizes.gap,
    minHeight: 100,
  },
  next: {
    flex: 0,
    minHeight: 160,
  },
});
