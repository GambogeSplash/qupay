// Simplified remittance types and mock data for the send flow.
// Ported from /Users/fubara/qupay/src/qupay/remittance.ts

export interface Recipient {
  id: string;
  name: string;
  initials: string;
  phone: string;
  country: string;
  flag: string;
  corridorId: string;
  payout: { kind: 'mobile_money' | 'bank' | 'wallet'; provider: string; accountTail?: string };
  handle?: string; // Qupay handle, e.g., '@emeka'
  hasQupayAccount?: boolean;
  lastSendUsd?: number; // last amount sent in USD
  lastSendDate?: string; // e.g., '2 days ago'
}

export interface Corridor {
  id: string;
  fromCountry: string;
  toCountry: string;
  toFlag: string;
  toCurrency: string;
  rate: number;
  feeUsd: number;
  speedSeconds: number;
  health: 'up' | 'degraded' | 'down';
}

export const CORRIDORS: Corridor[] = [
  { id: 'sg-ng', fromCountry: 'Singapore', toCountry: 'Nigeria', toFlag: '\u{1F1F3}\u{1F1EC}', toCurrency: 'NGN', rate: 1645, feeUsd: 1.50, speedSeconds: 30, health: 'up' },
  { id: 'sg-gh', fromCountry: 'Singapore', toCountry: 'Ghana', toFlag: '\u{1F1EC}\u{1F1ED}', toCurrency: 'GHS', rate: 15.16, feeUsd: 1.50, speedSeconds: 45, health: 'up' },
  { id: 'sg-ke', fromCountry: 'Singapore', toCountry: 'Kenya', toFlag: '\u{1F1F0}\u{1F1EA}', toCurrency: 'KES', rate: 128.7, feeUsd: 1.50, speedSeconds: 40, health: 'up' },
  { id: 'sg-ph', fromCountry: 'Singapore', toCountry: 'Philippines', toFlag: '\u{1F1F5}\u{1F1ED}', toCurrency: 'PHP', rate: 56.78, feeUsd: 1.00, speedSeconds: 35, health: 'up' },
  { id: 'sg-in', fromCountry: 'Singapore', toCountry: 'India', toFlag: '\u{1F1EE}\u{1F1F3}', toCurrency: 'INR', rate: 83.5, feeUsd: 1.00, speedSeconds: 25, health: 'up' },
  { id: 'sg-pk', fromCountry: 'Singapore', toCountry: 'Pakistan', toFlag: '\u{1F1F5}\u{1F1F0}', toCurrency: 'PKR', rate: 278.5, feeUsd: 1.50, speedSeconds: 50, health: 'up' },
];

export const getCorridor = (id: string): Corridor =>
  CORRIDORS.find((c) => c.id === id) ?? CORRIDORS[0];

export const MOCK_RECIPIENTS: Recipient[] = [
  { id: 'r1', name: 'Emeka Johnson', initials: 'EJ', phone: '0812 456 7890', country: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', corridorId: 'sg-ng', payout: { kind: 'mobile_money', provider: 'OPay', accountTail: '7890' }, handle: '@emeka', hasQupayAccount: true, lastSendUsd: 200, lastSendDate: '2 days ago' },
  { id: 'r2', name: 'Kofi Mensah', initials: 'KM', phone: '0541 234 567', country: 'Ghana', flag: '\u{1F1EC}\u{1F1ED}', corridorId: 'sg-gh', payout: { kind: 'mobile_money', provider: 'MTN Momo', accountTail: '4567' }, lastSendUsd: 50, lastSendDate: '5 days ago' },
  { id: 'r3', name: 'Adaeze Obi', initials: 'AO', phone: '0813 567 8901', country: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', corridorId: 'sg-ng', payout: { kind: 'bank', provider: 'GTBank', accountTail: '8901' }, handle: '@adaeze', hasQupayAccount: true, lastSendUsd: 100, lastSendDate: '3 hours ago' },
  { id: 'r4', name: 'Chidi Nwosu', initials: 'CN', phone: '0813 456 7890', country: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', corridorId: 'sg-ng', payout: { kind: 'mobile_money', provider: 'PalmPay', accountTail: '7890' }, lastSendUsd: 30, lastSendDate: '2 weeks ago' },
  { id: 'r5', name: 'Tunde Kareem', initials: 'TK', phone: '0901 234 5678', country: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', corridorId: 'sg-ng', payout: { kind: 'bank', provider: 'Kuda', accountTail: '5678' } },
  { id: 'r6', name: 'Faith Mwangi', initials: 'FM', phone: '+254 712 345 678', country: 'Kenya', flag: '\u{1F1F0}\u{1F1EA}', corridorId: 'sg-ke', payout: { kind: 'mobile_money', provider: 'M-Pesa', accountTail: '5678' }, lastSendUsd: 75, lastSendDate: '1 week ago' },
];

export function formatMoney(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$', NGN: '\u20A6', GHS: '\u20B5', KES: 'KSh', INR: '\u20B9', PHP: '\u20B1', PKR: 'Rs',
  };
  const sym = symbols[currency] || '';
  const isWhole = currency === 'NGN' || currency === 'KES' || currency === 'PHP' || currency === 'PKR';
  if (isWhole) return `${sym}${Math.round(amount).toLocaleString()}`;
  return `${sym}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
