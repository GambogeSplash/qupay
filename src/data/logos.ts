// Real bank + currency logo URIs.
// Banks use Clearbit's free logo API: https://logo.clearbit.com/{domain}
// Crypto uses cryptologos.cc CDN.
// Both are public/free; safe for prototype use, swap for self-hosted assets in prod.

export interface BrandLogo {
  uri: string;
  // Square crop hint — Clearbit and cryptologos already serve square logos.
  size?: number;
  // Background color used when the logo has transparency and we want a chip
  bg?: string;
}

// Bank / mobile money providers, keyed by lowercased name.
// Add aliases (e.g., "mtn momo") so lookups are forgiving.
export const BANK_LOGOS: Record<string, BrandLogo> = {
  // Nigeria — fintech / neobanks (verified domains for Clearbit resolution)
  'opay': { uri: 'https://logo.clearbit.com/opayweb.com', bg: '#1DCE59' },
  'palmpay': { uri: 'https://logo.clearbit.com/palmpay.com', bg: '#7F44E8' },
  'kuda': { uri: 'https://logo.clearbit.com/kudabank.com', bg: '#40196D' },
  'moniepoint': { uri: 'https://logo.clearbit.com/moniepoint.com', bg: '#0357EE' },
  'carbon': { uri: 'https://logo.clearbit.com/getcarbon.co', bg: '#0F36B6' },
  'fairmoney': { uri: 'https://logo.clearbit.com/fairmoney.io', bg: '#0066FF' },
  'cowrywise': { uri: 'https://logo.clearbit.com/cowrywise.com', bg: '#19568D' },
  'piggyvest': { uri: 'https://logo.clearbit.com/piggyvest.com', bg: '#0E2336' },
  'risevest': { uri: 'https://logo.clearbit.com/risevest.com', bg: '#1D2939' },
  'bamboo': { uri: 'https://logo.clearbit.com/investbamboo.com', bg: '#0EBC65' },
  'chipper': { uri: 'https://logo.clearbit.com/chippercash.com', bg: '#3361FF' },
  // Nigeria — traditional banks (using gtco.com for GTBank since they rebranded)
  'gtbank': { uri: 'https://logo.clearbit.com/gtco.com', bg: '#E55B13' },
  'gtb': { uri: 'https://logo.clearbit.com/gtco.com', bg: '#E55B13' },
  'gtco': { uri: 'https://logo.clearbit.com/gtco.com', bg: '#E55B13' },
  'access': { uri: 'https://logo.clearbit.com/accessbankplc.com', bg: '#003594' },
  'access bank': { uri: 'https://logo.clearbit.com/accessbankplc.com', bg: '#003594' },
  'zenith': { uri: 'https://logo.clearbit.com/zenithbank.com', bg: '#E60012' },
  'zenith bank': { uri: 'https://logo.clearbit.com/zenithbank.com', bg: '#E60012' },
  'first bank': { uri: 'https://logo.clearbit.com/firstbanknigeria.com', bg: '#003E80' },
  'firstbank': { uri: 'https://logo.clearbit.com/firstbanknigeria.com', bg: '#003E80' },
  'fbn': { uri: 'https://logo.clearbit.com/firstbanknigeria.com', bg: '#003E80' },
  'uba': { uri: 'https://logo.clearbit.com/ubagroup.com', bg: '#D80000' },
  'fcmb': { uri: 'https://logo.clearbit.com/fcmb.com', bg: '#592D82' },
  'fidelity': { uri: 'https://logo.clearbit.com/fidelitybank.ng', bg: '#1E266D' },
  'fidelity bank': { uri: 'https://logo.clearbit.com/fidelitybank.ng', bg: '#1E266D' },
  'union': { uri: 'https://logo.clearbit.com/unionbankng.com', bg: '#003366' },
  'union bank': { uri: 'https://logo.clearbit.com/unionbankng.com', bg: '#003366' },
  'sterling': { uri: 'https://logo.clearbit.com/sterling.ng', bg: '#DA251D' },
  'sterling bank': { uri: 'https://logo.clearbit.com/sterling.ng', bg: '#DA251D' },
  'wema': { uri: 'https://logo.clearbit.com/wemabank.com', bg: '#80186A' },
  'wema bank': { uri: 'https://logo.clearbit.com/wemabank.com', bg: '#80186A' },
  'alat': { uri: 'https://logo.clearbit.com/alat.ng', bg: '#A0228C' },
  'stanbic': { uri: 'https://logo.clearbit.com/stanbicibtc.com', bg: '#0033A0' },
  'stanbic ibtc': { uri: 'https://logo.clearbit.com/stanbicibtc.com', bg: '#0033A0' },
  'polaris': { uri: 'https://logo.clearbit.com/polarisbanklimited.com', bg: '#7F1B7B' },
  'polaris bank': { uri: 'https://logo.clearbit.com/polarisbanklimited.com', bg: '#7F1B7B' },
  'ecobank': { uri: 'https://logo.clearbit.com/ecobank.com', bg: '#005EB8' },
  'eco': { uri: 'https://logo.clearbit.com/ecobank.com', bg: '#005EB8' },
  'heritage': { uri: 'https://logo.clearbit.com/hbng.com', bg: '#005A2D' },
  'heritage bank': { uri: 'https://logo.clearbit.com/hbng.com', bg: '#005A2D' },
  'keystone': { uri: 'https://logo.clearbit.com/keystonebankng.com', bg: '#01459C' },
  'keystone bank': { uri: 'https://logo.clearbit.com/keystonebankng.com', bg: '#01459C' },
  'providus': { uri: 'https://logo.clearbit.com/providusbank.com', bg: '#A77E2A' },
  'providus bank': { uri: 'https://logo.clearbit.com/providusbank.com', bg: '#A77E2A' },
  'jaiz': { uri: 'https://logo.clearbit.com/jaizbankplc.com', bg: '#0F6D43' },
  'jaiz bank': { uri: 'https://logo.clearbit.com/jaizbankplc.com', bg: '#0F6D43' },
  'titan': { uri: 'https://logo.clearbit.com/titantrustbank.com', bg: '#003478' },
  'titan trust': { uri: 'https://logo.clearbit.com/titantrustbank.com', bg: '#003478' },
  'globus': { uri: 'https://logo.clearbit.com/globusbank.com', bg: '#FF6600' },
  'globus bank': { uri: 'https://logo.clearbit.com/globusbank.com', bg: '#FF6600' },
  'sunTrust': { uri: 'https://logo.clearbit.com/suntrustng.com', bg: '#003F87' },
  'lotus': { uri: 'https://logo.clearbit.com/lotusbank.com', bg: '#005EB8' },
  'lotus bank': { uri: 'https://logo.clearbit.com/lotusbank.com', bg: '#005EB8' },
  'taj': { uri: 'https://logo.clearbit.com/tajbank.com', bg: '#003E2D' },
  'taj bank': { uri: 'https://logo.clearbit.com/tajbank.com', bg: '#003E2D' },
  'parallex': { uri: 'https://logo.clearbit.com/parallexbank.com', bg: '#0078C1' },
  'parallex bank': { uri: 'https://logo.clearbit.com/parallexbank.com', bg: '#0078C1' },
  'rubies': { uri: 'https://logo.clearbit.com/rubiesbank.com', bg: '#E32027' },
  'vbank': { uri: 'https://logo.clearbit.com/vbank.ng', bg: '#1F3864' },
  'sparkle': { uri: 'https://logo.clearbit.com/sparkle.ng', bg: '#FF5F00' },
  'mintyn': { uri: 'https://logo.clearbit.com/mintyn.com', bg: '#1E3A8A' },
  'rex': { uri: 'https://logo.clearbit.com/rexbank.ng', bg: '#003366' },

  // Ghana / East Africa
  'mtn momo': { uri: 'https://logo.clearbit.com/mtn.com', bg: '#FFCB05' },
  'mtn mobile money': { uri: 'https://logo.clearbit.com/mtn.com', bg: '#FFCB05' },
  'mtn': { uri: 'https://logo.clearbit.com/mtn.com', bg: '#FFCB05' },
  'm-pesa': { uri: 'https://logo.clearbit.com/safaricom.co.ke', bg: '#00A651' },
  'mpesa': { uri: 'https://logo.clearbit.com/safaricom.co.ke', bg: '#00A651' },
  'safaricom': { uri: 'https://logo.clearbit.com/safaricom.co.ke', bg: '#00A651' },
  'airtel money': { uri: 'https://logo.clearbit.com/airtel.com', bg: '#E40000' },
  'tigo cash': { uri: 'https://logo.clearbit.com/tigo.com.gh', bg: '#1295D8' },

  // Asia
  'gcash': { uri: 'https://logo.clearbit.com/gcash.com', bg: '#0066CC' },
  'paymaya': { uri: 'https://logo.clearbit.com/paymaya.com', bg: '#21B14B' },
  'upi': { uri: 'https://logo.clearbit.com/npci.org.in', bg: '#097939' },
  'paytm': { uri: 'https://logo.clearbit.com/paytm.com', bg: '#00BAF2' },
  'phonepe': { uri: 'https://logo.clearbit.com/phonepe.com', bg: '#5F259F' },
  'easypaisa': { uri: 'https://logo.clearbit.com/easypaisa.com.pk', bg: '#00B14F' },
  'jazzcash': { uri: 'https://logo.clearbit.com/jazzcash.com.pk', bg: '#A6192E' },

  // Latin America
  'banorte': { uri: 'https://logo.clearbit.com/banorte.com', bg: '#EB0029' },
  'bbva': { uri: 'https://logo.clearbit.com/bbva.com', bg: '#004481' },
  'santander': { uri: 'https://logo.clearbit.com/santander.com', bg: '#EC0000' },
  'mercado pago': { uri: 'https://logo.clearbit.com/mercadopago.com', bg: '#00B1EA' },
};

// Token logos via CoinGecko CDN — higher quality + maintained by CoinGecko.
// Each token can be paired with a NETWORK_LOGO for chain-specific badging
// (e.g., USDT on Polygon shows the Tether T with a Polygon purple badge).
export const CURRENCY_LOGOS: Record<string, BrandLogo> = {
  'usdt': { uri: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png', bg: '#26A17B' },
  'usdc': { uri: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png', bg: '#2775CA' },
  'btc': { uri: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png', bg: '#F7931A' },
  'eth': { uri: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png', bg: '#627EEA' },
  'sol': { uri: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png', bg: '#9945FF' },
  'matic': { uri: 'https://assets.coingecko.com/coins/images/4713/standard/polygon.png', bg: '#8247E5' },
  'pol': { uri: 'https://assets.coingecko.com/coins/images/4713/standard/polygon.png', bg: '#8247E5' },
};

// Network / chain logos. Used as small badge overlays on top of a token icon.
// These are the actual L1/L2 brand marks, not the gas-token logos
// (e.g. Polygon network mark, not MATIC coin).
export const NETWORK_LOGOS: Record<string, BrandLogo> = {
  'polygon': { uri: 'https://assets.coingecko.com/coins/images/4713/standard/polygon.png', bg: '#8247E5' },
  'ethereum': { uri: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png', bg: '#627EEA' },
  'erc20': { uri: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png', bg: '#627EEA' },
  'erc-20': { uri: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png', bg: '#627EEA' },
  'solana': { uri: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png', bg: '#9945FF' },
  'tron': { uri: 'https://assets.coingecko.com/coins/images/1094/standard/tron-logo.png', bg: '#FF060A' },
  'trc20': { uri: 'https://assets.coingecko.com/coins/images/1094/standard/tron-logo.png', bg: '#FF060A' },
  'trc-20': { uri: 'https://assets.coingecko.com/coins/images/1094/standard/tron-logo.png', bg: '#FF060A' },
  'bsc': { uri: 'https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png', bg: '#F0B90B' },
  'bnb': { uri: 'https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png', bg: '#F0B90B' },
  'arbitrum': { uri: 'https://assets.coingecko.com/coins/images/16547/standard/arb.jpg', bg: '#28A0F0' },
  'base': { uri: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png', bg: '#0052FF' },
  'optimism': { uri: 'https://assets.coingecko.com/coins/images/25244/standard/Optimism.png', bg: '#FF0420' },
};

export const findNetworkLogo = (network: string | undefined | null): BrandLogo | undefined => {
  if (!network) return undefined;
  return NETWORK_LOGOS[network.toLowerCase().trim()];
};

// Abstract avatar generator — DiceBear PNG endpoint, deterministic per seed.
// Style options:
//   shapes      → colorful geometric (default, most "abstract")
//   glass       → 3D glass shapes
//   thumbs      → thumb-print abstract
//   identicon   → pixelated abstract
//   notionists  → line-art human (less abstract, more illustrative)
//   lorelei     → friendly cartoon human
//   bottts      → small robot
export type AvatarStyle =
  | 'shapes'
  | 'glass'
  | 'thumbs'
  | 'identicon'
  | 'notionists'
  | 'lorelei'
  | 'bottts'
  | 'fun-emoji'
  | 'rings';

export const getAvatarUri = (seed: string, style: AvatarStyle = 'notionists'): string => {
  const safeSeed = encodeURIComponent(seed.trim() || 'qupay');
  // notionists = line-art human portraits, feels personal and premium.
  // Background colors from brand palette for variety.
  const bg = '38bdf8,0ea5e9,4ade80,fbbf24,a78bfa,fb923c,2dd4bf,f472b6';
  return `https://api.dicebear.com/7.x/${style}/png?seed=${safeSeed}&backgroundColor=${bg}&backgroundType=gradientLinear&size=256`;
};

// Lookup helper — case + space tolerant.
export const findBankLogo = (name: string | undefined | null): BrandLogo | undefined => {
  if (!name) return undefined;
  const key = name.toLowerCase().trim();
  if (BANK_LOGOS[key]) return BANK_LOGOS[key];
  // Try first-word match (e.g., "OPay Wallet" → "opay")
  const firstWord = key.split(/\s+/)[0];
  return BANK_LOGOS[firstWord];
};

export const findCurrencyLogo = (code: string | undefined | null): BrandLogo | undefined => {
  if (!code) return undefined;
  return CURRENCY_LOGOS[code.toLowerCase().trim()];
};
