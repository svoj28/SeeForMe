// Product lookup by barcode in Open Food Facts (free, open database, ODbL).
// Only the barcode NUMBER is sent; the picture never leaves the phone.
// https://openfoodfacts.github.io/openfoodfacts-server/api/

const ENDPOINT = 'https://world.openfoodfacts.org/api/v2/product/';
const TIMEOUT_MS = 8000;

/** EAN/UPC barcodes worth looking up. */
export const PRODUCT_BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e'];

/**
 * @returns {Promise<{ status: 'found', name, brand, quantity } | { status: 'not-found' } | { status: 'offline' }>}
 */
export async function lookUpProduct(code, lang = 'en') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `${ENDPOINT}${encodeURIComponent(code)}.json?fields=product_name,product_name_${lang},brands,quantity,generic_name`;
    // Open Food Facts asks apps to identify themselves in the User-Agent.
    const res = await fetch(url, { headers: { 'User-Agent': 'SeeForMe/1.0 (accessibility app)' }, signal: controller.signal });
    if (res.status === 404) return { status: 'not-found' };
    if (!res.ok) return { status: 'offline' };
    const json = await res.json();
    const p = json?.product;
    if (json?.status !== 1 || !p) return { status: 'not-found' };
    const name = p[`product_name_${lang}`] || p.product_name || p.generic_name;
    if (!name) return { status: 'not-found' };
    return { status: 'found', name: name.trim(), brand: (p.brands || '').split(',')[0].trim(), quantity: (p.quantity || '').trim() };
  } catch (e) {
    return { status: 'offline' };
  } finally {
    clearTimeout(timer);
  }
}

/** "Nescafé Classic, by Nestlé, 100 g" */
export function describeProduct(p, byWord) {
  return [p.name, p.brand && `${byWord} ${p.brand}`, p.quantity].filter(Boolean).join(', ');
}

/** Barcode digits spoken in small groups, so they are easy to follow. */
export const spokenBarcode = (code) => code.replace(/(\d{4})(?=\d)/g, '$1 ');
