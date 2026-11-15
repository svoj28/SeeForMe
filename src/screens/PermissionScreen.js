import { useEffect } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BigButton from '../components/BigButton';
import { colors, sizes } from '../theme';
import { say } from '../feedback';
import { t } from '../i18n';

export default function PermissionScreen({ canAskAgain, onRequest }) {
  const message = canAskAgain ? t('perm.ask') : t('perm.settings');

  useEffect(() => {
    say(message);
  }, [message]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header} accessible accessibilityRole="header">
        <Text style={styles.title}>SeeForMe</Text>
        <Text style={styles.body}>{message}</Text>
      </View>
      <BigButton
        label={canAskAgain ? t('perm.allow') : t('perm.open')}
        hint={canAskAgain ? t('perm.allowHint') : t('perm.openHint')}
        color={colors.primary}
        onPress={canAskAgain ? onRequest : () => Linking.openSettings()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: sizes.gap * 2,
    gap: sizes.gap * 2,
  },
  header: {
    gap: sizes.gap,
  },
  title: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '900',
  },
  body: {
    color: colors.text,
    fontSize: sizes.statusText,
    lineHeight: sizes.statusText * 1.35,
  },
});
