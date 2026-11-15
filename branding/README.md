# SeeForMe brand

**Concept: "seeing through sound."** An eye whose pupil gives off sound waves,
because the app sees for you and then speaks. Black on bright yellow: the same
high-contrast colours as the app itself, easy to find for users with low vision.

## Files

| File | Use |
|---|---|
| `icon.svg` | Master app icon, full-bleed square (iOS and stores round the corners) |
| `icon-rounded.svg` | Rounded tile: splash screen, favicon, inside the logo |
| `android-foreground.svg` / `android-background.svg` | Android adaptive icon layers (the eye fits the 61% safe circle) |
| `android-monochrome.svg` | Android 13+ themed icon (shape only, the system adds the colour) |
| `logo-on-dark.svg` / `.png` | Horizontal logo for dark backgrounds |
| `logo-on-light.svg` / `.png` | Horizontal logo for light backgrounds |

The app's PNG icons in `../assets/` are rendered from these SVGs.

## Colours

| Name | Hex | Use |
|---|---|---|
| Yellow (light) | `#FFE14D` | Gradient start |
| Yellow (deep) | `#FFB300` | Gradient end, "For" on dark backgrounds |
| Ink | `#0D0D12` | The eye, text on light backgrounds |
| Amber | `#9A5B00` | "For" on light backgrounds (yellow on white is only 1.8:1, amber is 5.4:1) |
| White | `#FFFFFF` | Pupil highlight, text on dark backgrounds |

Ink on the yellow gradient is 10.8:1 to 14.9:1 contrast (WCAG AAA needs 7:1),
and yellow on black is 11.7:1.

## Type

Wordmark: **Montserrat ExtraBold (800)**, tagline: Montserrat SemiBold (600),
letter-spaced capitals. Before printing or sending the logo SVGs to other tools,
convert the text to outlines (they use the installed Montserrat font).

## Rules

- Keep the yellow and black: the contrast is the point.
- Don't put the logo on busy photos or mid-tone backgrounds.
- Leave space around the icon of at least a quarter of its width.
