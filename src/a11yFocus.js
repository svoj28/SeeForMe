import { AccessibilityInfo, findNodeHandle } from 'react-native';

/**
 * Moves TalkBack / VoiceOver focus to an element (a ref), e.g. back to the
 * button that opened a menu once the menu closes, so a blind user isn't dropped
 * at the top of the screen. Waits a moment for the screen to finish drawing.
 */
export function focusOn(ref, delayMs = 350) {
  setTimeout(() => {
    const node = ref?.current;
    if (!node) return;
    try {
      if (AccessibilityInfo.sendAccessibilityEvent) AccessibilityInfo.sendAccessibilityEvent(node, 'focus');
      else {
        const tag = findNodeHandle(node);
        if (tag) AccessibilityInfo.setAccessibilityFocus(tag);
      }
    } catch (e) {
      console.warn('focus failed', e);
    }
  }, delayMs);
}
