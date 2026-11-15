import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import BigButton from './BigButton';
import { colors, sizes } from '../theme';
import { say } from '../feedback';
import { t } from '../i18n';
import { focusOn } from '../a11yFocus';

/**
 * Full-screen list of large buttons, drawn over the camera so the camera
 * keeps running underneath. Used for "More tools" and the "Find what?" picker.
 * Screen-reader focus starts on the title; the Z / two-finger scrub gesture
 * (VoiceOver escape) closes it, like the Android back button.
 *
 * @param {{ title: string, intro: string, items: { id: string, label: string, hint?: string }[],
 *           selectedId?: string, onPick: (id: string) => void, onClose: () => void }} props
 */
export default function ToolsMenu({ title, intro, items, selectedId, onPick, onClose }) {
  const titleRef = useRef(null);

  useEffect(() => {
    say(intro);
    focusOn(titleRef);
  }, [intro]);

  return (
    <View style={styles.overlay} accessibilityViewIsModal onAccessibilityEscape={onClose}>
      <Text ref={titleRef} style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <ScrollView contentContainerStyle={styles.list}>
        {items.map((item, i) => {
          const current = item.id === selectedId;
          return (
            <BigButton
              key={item.id}
              // "3 of 9" helps a blind user know how long the list is and where they are.
              label={current ? t('tools.current', item.label) : item.label}
              hint={[t('tools.position', i + 1, items.length), item.hint].filter(Boolean).join('. ')}
              selected={selectedId !== undefined ? current : undefined}
              color={current ? colors.primary : colors.secondary}
              onPress={() => onPick(item.id)}
              style={styles.item}
            />
          );
        })}
      </ScrollView>
      <BigButton label={t('btn.close')} hint={t('hint.close')} color={colors.accent} onPress={onClose} style={styles.close} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    padding: sizes.gap,
    gap: sizes.gap,
    zIndex: 10,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
  list: {
    gap: sizes.gap,
    paddingBottom: sizes.gap,
  },
  item: {
    flex: 0,
    minHeight: 88,
  },
  close: {
    flex: 0,
    minHeight: 110,
  },
});
