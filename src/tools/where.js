import * as Location from 'expo-location';

/**
 * Finds the nearest street address.
 * @returns {Promise<{ status: 'ok', address: string, accuracy: number|null }
 *   | { status: 'no-permission' | 'failed' | 'no-address', accuracy?: number|null }>}
 */
export async function whereAmI() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) return { status: 'no-permission' };

  let position;
  try {
    position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  } catch (e) {
    try {
      position = await Location.getLastKnownPositionAsync();
    } catch {}
  }
  if (!position) return { status: 'failed' };
  const accuracy = position.coords.accuracy ? Math.round(position.coords.accuracy) : null;

  try {
    const [place] = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    const address = formatAddress(place);
    if (!address) return { status: 'no-address', accuracy };
    return { status: 'ok', address, accuracy };
  } catch (e) {
    return { status: 'no-address', accuracy };
  }
}

/** "12 Rizal Street, Poblacion, Makati" — skips empty and repeated parts. */
export function formatAddress(place) {
  if (!place) return '';
  const street = [place.streetNumber, place.street].filter(Boolean).join(' ');
  const parts = [street || place.name, place.district, place.city || place.subregion];
  const seen = new Set();
  return parts
    .filter(Boolean)
    .map((p) => p.trim())
    .filter((p) => {
      const key = p.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(', ');
}
