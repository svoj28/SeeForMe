// High-contrast palette: pure black background, bright saturated buttons with
// dark text. Every pairing here exceeds WCAG AAA (7:1) contrast.
export const colors = {
  background: '#000000',
  text: '#FFFFFF',
  primary: '#FFD400', // yellow, black text
  secondary: '#FFFFFF', // white, black text
  accent: '#00E5FF', // cyan, black text
  read: '#7CFF6B', // green, black text
  tool: '#FF9AE0', // pink, black text (10.9:1): the chosen-tool button, Read money by default
  off: '#9E9E9E', // gray for settings that are off, black text (7.4:1)
  warning: '#FFA000', // amber, black text: "reading money on the phone" indicator (10:1)
  onButton: '#000000',
  border: '#FFFFFF',
};

export const sizes = {
  gap: 12,
  radius: 20,
  buttonText: 30,
  statusText: 26,
};
