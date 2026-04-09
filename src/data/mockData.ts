// Qupay — crypto-to-fiat remittance mock data

export interface Corridor {
  id: string;
  fromFlag: string;
  fromCountry: string;
  fromCode: string;
  toFlag: string;
  toCountry: string;
  toCode: string;
  rate: number;
  fee: number;
  deliveryTime: string;
  payoutMethods: string[];
}

export interface Recipient {
  id: string;
  name: string;
  initials: string;
  color: string;
  phone: string;
  country: string;
  flag: string;
  accountType: 'mobile_money' | 'bank' | 'wallet';
  accountLabel: string;
  recent: boolean;
  walletAddress?: string;
  walletNetwork?: string;
}

export interface Transfer {
  id: string;
  recipientId: string;
  corridorId: string;
  sendAmount: number;
  sendCurrency: string;
  receiveAmount: number;
  receiveCurrency: string;
  fee: number;
  rate: number;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  timestamp: number;
  reference: string;
  payoutMethod: string;
}

export const corridors: Corridor[] = [
  { id: 'sg-ng', fromFlag: '🇸🇬', fromCountry: 'Singapore', fromCode: 'SGD', toFlag: '🇳🇬', toCountry: 'Nigeria', toCode: 'NGN', rate: 1145.20, fee: 1.5, deliveryTime: '<2 min', payoutMethods: ['Mobile Money', 'Bank Transfer'] },
  { id: 'sg-gh', fromFlag: '🇸🇬', fromCountry: 'Singapore', fromCode: 'SGD', toFlag: '🇬🇭', toCountry: 'Ghana', toCode: 'GHS', rate: 11.82, fee: 1.5, deliveryTime: '<2 min', payoutMethods: ['MTN MoMo', 'Bank Transfer'] },
  { id: 'sg-ke', fromFlag: '🇸🇬', fromCountry: 'Singapore', fromCode: 'SGD', toFlag: '🇰🇪', toCountry: 'Kenya', toCode: 'KES', rate: 98.45, fee: 1.8, deliveryTime: '<5 min', payoutMethods: ['M-Pesa', 'Bank Transfer'] },
  { id: 'uk-ng', fromFlag: '🇬🇧', fromCountry: 'United Kingdom', fromCode: 'GBP', toFlag: '🇳🇬', toCountry: 'Nigeria', toCode: 'NGN', rate: 2012.30, fee: 1.2, deliveryTime: '<2 min', payoutMethods: ['Mobile Money', 'Bank Transfer'] },
  { id: 'us-ph', fromFlag: '🇺🇸', fromCountry: 'United States', fromCode: 'USD', toFlag: '🇵🇭', toCountry: 'Philippines', toCode: 'PHP', rate: 56.78, fee: 1.5, deliveryTime: '<5 min', payoutMethods: ['GCash', 'Bank Transfer'] },
  { id: 'ae-pk', fromFlag: '🇦🇪', fromCountry: 'UAE', fromCode: 'AED', toFlag: '🇵🇰', toCountry: 'Pakistan', toCode: 'PKR', rate: 75.60, fee: 1.3, deliveryTime: '<10 min', payoutMethods: ['JazzCash', 'Bank Transfer'] },
  { id: 'us-mx', fromFlag: '🇺🇸', fromCountry: 'United States', fromCode: 'USD', toFlag: '🇲🇽', toCountry: 'Mexico', toCode: 'MXN', rate: 17.24, fee: 1.0, deliveryTime: '<2 min', payoutMethods: ['SPEI', 'Bank Transfer'] },
  { id: 'uk-in', fromFlag: '🇬🇧', fromCountry: 'United Kingdom', fromCode: 'GBP', toFlag: '🇮🇳', toCountry: 'India', toCode: 'INR', rate: 106.50, fee: 1.2, deliveryTime: '<5 min', payoutMethods: ['UPI', 'Bank Transfer'] },
];

export const recipients: Recipient[] = [
  { id: '1', name: 'Amara Obi', initials: 'AO', color: '#1A6FFF', phone: '+234 812 345 6789', country: 'Nigeria', flag: '🇳🇬', accountType: 'mobile_money', accountLabel: 'MTN MoMo', recent: true },
  { id: '2', name: 'Kwame Asante', initials: 'KA', color: '#38BDF8', phone: '+233 24 567 8901', country: 'Ghana', flag: '🇬🇭', accountType: 'mobile_money', accountLabel: 'MTN MoMo', recent: true },
  { id: '3', name: 'Faith Mwangi', initials: 'FM', color: '#FFD60A', phone: '+254 712 345 678', country: 'Kenya', flag: '🇰🇪', accountType: 'mobile_money', accountLabel: 'M-Pesa', recent: true },
  { id: '4', name: 'Carlos Rivera', initials: 'CR', color: '#EF4444', phone: '+52 55 1234 5678', country: 'Mexico', flag: '🇲🇽', accountType: 'bank', accountLabel: 'Banorte', recent: false },
  { id: '5', name: 'Priya Sharma', initials: 'PS', color: '#9896FF', phone: '+91 98765 43210', country: 'India', flag: '🇮🇳', accountType: 'bank', accountLabel: 'HDFC Bank', recent: false },
  { id: '6', name: 'Maria Santos', initials: 'MS', color: '#00bfff', phone: '+63 917 123 4567', country: 'Philippines', flag: '🇵🇭', accountType: 'mobile_money', accountLabel: 'GCash', recent: false },
];

export const transfers: Transfer[] = [
  { id: '1', recipientId: '1', corridorId: 'sg-ng', sendAmount: 200, sendCurrency: 'USDT', receiveAmount: 320_400, receiveCurrency: 'NGN', fee: 3.0, rate: 1602, status: 'completed', timestamp: Date.now() - 3600000, reference: 'QP-7X2K9M', payoutMethod: 'MTN MoMo' },
  { id: '2', recipientId: '2', corridorId: 'sg-gh', sendAmount: 150, sendCurrency: 'USDT', receiveAmount: 2_274, receiveCurrency: 'GHS', fee: 2.25, rate: 15.16, status: 'completed', timestamp: Date.now() - 86400000, reference: 'QP-A3F8N1', payoutMethod: 'MTN MoMo' },
  { id: '3', recipientId: '3', corridorId: 'sg-ke', sendAmount: 500, sendCurrency: 'USDT', receiveAmount: 64_350, receiveCurrency: 'KES', fee: 9.0, rate: 128.7, status: 'processing', timestamp: Date.now() - 120000, reference: 'QP-R5T2W8', payoutMethod: 'M-Pesa' },
  { id: '4', recipientId: '1', corridorId: 'sg-ng', sendAmount: 100, sendCurrency: 'USDT', receiveAmount: 159_800, receiveCurrency: 'NGN', fee: 1.5, rate: 1598, status: 'completed', timestamp: Date.now() - 172800000, reference: 'QP-K9M4P6', payoutMethod: 'Bank Transfer' },
  { id: '5', recipientId: '4', corridorId: 'us-mx', sendAmount: 300, sendCurrency: 'USDT', receiveAmount: 5_148, receiveCurrency: 'MXN', fee: 3.0, rate: 17.16, status: 'completed', timestamp: Date.now() - 345600000, reference: 'QP-B7L2X4', payoutMethod: 'SPEI' },
  { id: '6', recipientId: '5', corridorId: 'uk-in', sendAmount: 250, sendCurrency: 'USDT', receiveAmount: 20_875, receiveCurrency: 'INR', fee: 3.0, rate: 83.5, status: 'completed', timestamp: Date.now() - 518400000, reference: 'QP-C1N8V3', payoutMethod: 'UPI' },
  { id: '7', recipientId: '2', corridorId: 'sg-gh', sendAmount: 75, sendCurrency: 'USDT', receiveAmount: 1_128, receiveCurrency: 'GHS', fee: 1.12, rate: 15.04, status: 'failed', timestamp: Date.now() - 604800000, reference: 'QP-D4H6J9', payoutMethod: 'MTN MoMo' },
];

export const userProfile = {
  name: 'Raj',
  initials: 'RA',
  phone: '+65 9123 4567',
  country: 'Singapore',
  flag: '🇸🇬',
  email: 'raj@example.com',
  joinedDate: '2025-11-01',
  totalSent: 4_280,
  totalTransfers: 23,
  totalSaved: 186.50,
  defaultCorridor: 'sg-ng',
};

export const countries = [
  { flag: '🇸🇬', name: 'Singapore', code: '+65', reg: 'MAS regulated', currency: 'SGD' },
  { flag: '🇬🇧', name: 'United Kingdom', code: '+44', reg: 'FCA regulated', currency: 'GBP' },
  { flag: '🇺🇸', name: 'United States', code: '+1', reg: 'FinCEN regulated', currency: 'USD' },
  { flag: '🇦🇪', name: 'UAE', code: '+971', reg: 'VARA regulated', currency: 'AED' },
  { flag: '🇳🇬', name: 'Nigeria', code: '+234', reg: 'SEC/CBN regulated', currency: 'NGN' },
  { flag: '🇬🇭', name: 'Ghana', code: '+233', reg: 'BoG regulated', currency: 'GHS' },
  { flag: '🇰🇪', name: 'Kenya', code: '+254', reg: 'CBK regulated', currency: 'KES' },
  { flag: '🇮🇳', name: 'India', code: '+91', reg: 'RBI regulated', currency: 'INR' },
  { flag: '🇵🇭', name: 'Philippines', code: '+63', reg: 'BSP regulated', currency: 'PHP' },
  { flag: '🇲🇽', name: 'Mexico', code: '+52', reg: 'CNBV regulated', currency: 'MXN' },
  { flag: '🇵🇰', name: 'Pakistan', code: '+92', reg: 'SBP regulated', currency: 'PKR' },
  { flag: '🇿🇦', name: 'South Africa', code: '+27', reg: 'SARB regulated', currency: 'ZAR' },
];

export const destinationCountries = [
  'Nigeria', 'Ghana', 'Kenya', 'India', 'Philippines', 'Mexico', 'Pakistan', 'South Africa',
];

export interface Bank {
  id: string;
  name: string;
  popular?: boolean;
}

export const banks: Record<string, Bank[]> = {
  Nigeria: [
    { id: 'gtbank', name: 'GTBank', popular: true },
    { id: 'access', name: 'Access Bank', popular: true },
    { id: 'firstbank', name: 'First Bank', popular: true },
    { id: 'zenith', name: 'Zenith Bank', popular: true },
    { id: 'uba', name: 'UBA', popular: true },
    { id: 'fcmb', name: 'FCMB' },
    { id: 'fidelity_ng', name: 'Fidelity Bank' },
    { id: 'union', name: 'Union Bank' },
    { id: 'stanbic', name: 'Stanbic IBTC' },
    { id: 'sterling', name: 'Sterling Bank' },
    { id: 'wema', name: 'Wema Bank' },
    { id: 'polaris', name: 'Polaris Bank' },
    { id: 'keystone', name: 'Keystone Bank' },
    { id: 'ecobank_ng', name: 'Ecobank Nigeria' },
    { id: 'jaiz', name: 'Jaiz Bank' },
    { id: 'providus', name: 'Providus Bank' },
    { id: 'kuda', name: 'Kuda Bank' },
    { id: 'opay', name: 'OPay' },
    { id: 'palmpay', name: 'PalmPay' },
    { id: 'moniepoint', name: 'Moniepoint' },
    { id: 'globus', name: 'Globus Bank' },
    { id: 'titan', name: 'Titan Trust Bank' },
    { id: 'heritage', name: 'Heritage Bank' },
    { id: 'unity', name: 'Unity Bank' },
    { id: 'suntrust', name: 'SunTrust Bank' },
    { id: 'citibank_ng', name: 'Citibank Nigeria' },
    { id: 'standardchartered_ng', name: 'Standard Chartered' },
  ],
  Ghana: [
    { id: 'gcb', name: 'GCB Bank' },
    { id: 'ecobank', name: 'Ecobank' },
    { id: 'fidelity', name: 'Fidelity Bank' },
  ],
  Kenya: [
    { id: 'kcb', name: 'KCB' },
    { id: 'equity', name: 'Equity Bank' },
    { id: 'cooperative', name: 'Co-operative Bank' },
  ],
  India: [
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'sbi', name: 'SBI' },
    { id: 'icici', name: 'ICICI Bank' },
  ],
  Philippines: [
    { id: 'bpi', name: 'BPI' },
    { id: 'bdo', name: 'BDO' },
    { id: 'metrobank', name: 'Metrobank' },
  ],
  Mexico: [
    { id: 'bbva', name: 'BBVA' },
    { id: 'banorte', name: 'Banorte' },
    { id: 'santander', name: 'Santander' },
  ],
  Pakistan: [
    { id: 'hbl', name: 'HBL' },
    { id: 'mcb', name: 'MCB' },
    { id: 'ubl', name: 'UBL' },
  ],
  'South Africa': [
    { id: 'fnb', name: 'FNB' },
    { id: 'standard', name: 'Standard Bank' },
    { id: 'absa', name: 'Absa' },
  ],
};

export const mobileMoneyProviders: Record<string, string> = {
  Nigeria: 'Opay',
  Ghana: 'MTN MoMo',
  Kenya: 'M-Pesa',
  Philippines: 'GCash',
  Pakistan: 'JazzCash',
  'South Africa': 'Vodapay',
  India: 'UPI',
  Mexico: 'SPEI',
};

export interface Network {
  id: string;
  name: string;
  icon: string;
  gasEstimate: string;
  address: string;
}

export const networks: Network[] = [
  { id: 'ethereum', name: 'Ethereum', icon: 'logo-electron', gasEstimate: '~$2.50', address: '0x7a3B8c9D1e2F3a4B5c6D7e8F9a0B1c2D3e4F2e' },
  { id: 'polygon', name: 'Polygon', icon: 'triangle-outline', gasEstimate: '~$0.01', address: '0x4c2A9f8E3d7B6a1C0e5F2d8A9b4C7e6F3a1D5b' },
  { id: 'arbitrum', name: 'Arbitrum', icon: 'git-branch-outline', gasEstimate: '~$0.15', address: '0x9d5F2e8A1b3C7d6E0f4A8B9c2D5e7F1a3B6c4d' },
  { id: 'base', name: 'Base', icon: 'layers-outline', gasEstimate: '~$0.05', address: '0x1e8B4f7A2c9D3e6F5a0B8c1D4e7F9a2B5c3D6e' },
];

export interface WalletContact {
  id: string;
  name: string;
  initials: string;
  colors: [string, string];
  walletAddress: string;
  network: string;
  networkIcon: string;
}

export const walletContacts: WalletContact[] = [
  { id: 'w1', name: 'Alex Chen', initials: 'AC', colors: ['#1a6fff', '#38bdf8'], walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', network: 'Polygon', networkIcon: 'triangle-outline' },
  { id: 'w2', name: 'Sarah Kim', initials: 'SK', colors: ['#ff9f43', '#ff4d6a'], walletAddress: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', network: 'Base', networkIcon: 'layers-outline' },
  { id: 'w3', name: 'Mike Johnson', initials: 'MJ', colors: ['#a855f7', '#1a6fff'], walletAddress: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec', network: 'Ethereum', networkIcon: 'logo-electron' },
];

export function formatCurrency(value: number, decimals = 2): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return value.toFixed(decimals);
}

export function formatMoney(value: number, currency: string): string {
  const symbols: Record<string, string> = {
    USDT: '', NGN: '₦', GHS: '₵', KES: 'KSh ', INR: '₹', PHP: '₱', MXN: '$', PKR: 'Rs ', ZAR: 'R', SGD: 'S$', GBP: '£', USD: '$', AED: 'AED ',
  };
  const sym = symbols[currency] || '';
  return `${sym}${formatCurrency(value)}`;
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}
