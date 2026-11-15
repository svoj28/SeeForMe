import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BigButton from '../components/BigButton';
import { colors, sizes } from '../theme';
import { say } from '../feedback';
import { t } from '../i18n';

/** Credits, licences and safety notes. Opened from Settings. */
export default function AboutScreen({ onClose }) {
  const credits = t('credits');

  useEffect(() => {
    say(t('about.spoken', credits));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          {t('about.title')}
        </Text>
        {credits.map((line) => (
          <Text key={line} style={styles.body}>
            {line}
          </Text>
        ))}
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
    gap: sizes.gap * 1.5,
    padding: sizes.gap,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
  },
  body: {
    color: colors.text,
    fontSize: sizes.statusText,
    lineHeight: sizes.statusText * 1.35,
  },
  back: {
    flex: 0,
    minHeight: 120,
  },
});
