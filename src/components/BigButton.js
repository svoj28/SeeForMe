import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, sizes } from '../theme';
import { buzz, isScreenReaderOn, isTouchToHearOn, say } from '../feedback';
import { t } from '../i18n';

// Touch-to-hear: without a screen reader, the first tap on a button speaks
// its name and the second tap (within this window) activates it. With
// TalkBack/VoiceOver on, the screen reader already does this, so we stay out
// of the way.
const DOUBLE_TAP_MS = 2500;
let armed = { label: null, at: 0 };

/**
 * Huge, high-contrast button. It fills whatever space its parent gives it, so
 * it's easy to find by touch. It announces itself to screen readers with a
 * role, a label, and a hint saying what will happen.
 */
export default function BigButton({
  label,
  hint,
  onPress,
  color = colors.secondary,
  disabled = false,
  selected,
  loading = false, // shows a spinner next to the label (work in progress)
  style,
  ref, // React 19: lets screens move screen-reader focus back to this button
}) {
  const activate = () => {
    armed = { label: null, at: 0 };
    buzz.tap();
    onPress?.();
  };

  const handlePress = () => {
    if (disabled) {
      buzz.error();
      say(t('button.notAvailable', label));
      return;
    }
    if (isScreenReaderOn() || !isTouchToHearOn()) {
      activate();
      return;
    }
    const now = Date.now();
    if (armed.label === label && now - armed.at < DOUBLE_TAP_MS) {
      activate();
      return;
    }
    armed = { label, at: now };
    buzz.select();
    say(t('button.spoken', label, hint));
  };

  return (
    <Pressable
      ref={ref}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled, busy: loading, ...(selected !== undefined && { selected }) }}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color, opacity: disabled && !loading ? 0.5 : 1 },
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading && <ActivityIndicator size="large" color={colors.onButton} />}
        <Text style={[styles.label, loading && styles.labelLoading]} numberOfLines={3} adjustsFontSizeToFit>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 88,
    borderRadius: sizes.radius,
    borderWidth: 4,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    borderColor: colors.accent,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    maxWidth: '100%',
  },
  labelLoading: {
    flexShrink: 1,
  },
  label: {
    color: colors.onButton,
    fontSize: sizes.buttonText,
    fontWeight: '800',
    textAlign: 'center',
  },
});
