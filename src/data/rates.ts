// Live exchange rates — fetches from CoinGecko free API.
// Falls back to hardcoded rates if the fetch fails (offline/rate-limited).
// Rates are USDT→fiat, cached for 60 seconds.

const FALLBACK_RATES: Record<string, number> = {
  NGN: 1645, GHS: 15.16, KES: 128.7, INR: 83.5, PHP: 56.78, PKR: 278.5,
};

// CoinGecko IDs for fiat currencies
const COINGECKO_FIAT = ['ngn', 'ghs', 'kes', 'inr', 'php', 'pkr'];

let cachedRates: Record<string, number> | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 60 seconds

export async function fetchLiveRates(): Promise<Record<string, number>> {
  // Return cache if fresh
  if (cachedRates && Date.now() - cacheTime < CACHE_TTL) {
    return cachedRates;
  }

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=${COINGECKO_FIAT.join(',')}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const tether = data.tether;
    if (!tether) throw new Error('No tether data');

    const rates: Record<string, number> = {};
    for (const [fiat, value] of Object.entries(tether)) {
      rates[fiat.toUpperCase()] = value as number;
    }

    cachedRates = { ...FALLBACK_RATES, ...rates };
    cacheTime = Date.now();
    return cachedRates;
  } catch (err) {
    if (__DEV__) console.warn('Rate fetch failed, using fallback:', err);
    return FALLBACK_RATES;
  }
}

// Synchronous getter — returns cached or fallback (never blocks)
export function getRates(): Record<string, number> {
  return cachedRates ?? FALLBACK_RATES;
}

export function getRate(currency: string): number {
  const rates = getRates();
  return rates[currency.toUpperCase()] ?? FALLBACK_RATES[currency.toUpperCase()] ?? 1;
}
