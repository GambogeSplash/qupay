// Transfer store — Zustand with AsyncStorage persistence.
// Manages recipients, transfers, and the full transaction lifecycle.
import { create } from 'zustand';
// Note: For full persistence, install zustand/middleware + @react-native-async-storage/async-storage.
// For now we use in-memory state that persists for the session.

import { Recipient, MOCK_RECIPIENTS } from '../data/remittance';

export type TransferStatus = 'created' | 'deposited' | 'processing' | 'delivered' | 'failed';

export interface Transfer {
  id: string;
  recipient: Recipient;
  sendAmount: number;
  receiveAmount: number;
  sendCurrency: string;
  recvCurrency: string;
  network: string;
  status: TransferStatus;
  createdAt: number;
  deliveredAt?: number;
  failedReason?: string;
  txHash: string;
}

interface TransferStore {
  // Recipients
  recipients: Recipient[];
  addRecipient: (r: Recipient) => void;

  // Transfers
  transfers: Transfer[];
  createTransfer: (params: {
    recipient: Recipient;
    sendAmount: number;
    receiveAmount: number;
    sendCurrency: string;
    recvCurrency: string;
    network: string;
  }) => Transfer;
  updateStatus: (id: string, status: TransferStatus) => void;
  failTransfer: (id: string, reason: string) => void;
  deliverTransfer: (id: string) => void;

  // Stats
  totalSentUsd: number;
}

function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * 16)];
  return hash;
}

export const useTransferStore = create<TransferStore>((set, get) => ({
  recipients: [...MOCK_RECIPIENTS],
  transfers: [],
  totalSentUsd: 450, // Mock starting total

  addRecipient: (r) =>
    set((s) => ({
      recipients: [r, ...s.recipients.filter((x) => x.id !== r.id)],
    })),

  createTransfer: (params) => {
    const transfer: Transfer = {
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...params,
      status: 'created',
      createdAt: Date.now(),
      txHash: generateTxHash(),
    };
    set((s) => ({
      transfers: [transfer, ...s.transfers],
    }));
    return transfer;
  },

  updateStatus: (id, status) =>
    set((s) => ({
      transfers: s.transfers.map((t) =>
        t.id === id ? { ...t, status } : t
      ),
    })),

  failTransfer: (id, reason) =>
    set((s) => ({
      transfers: s.transfers.map((t) =>
        t.id === id ? { ...t, status: 'failed' as TransferStatus, failedReason: reason } : t
      ),
    })),

  deliverTransfer: (id) =>
    set((s) => ({
      transfers: s.transfers.map((t) =>
        t.id === id ? { ...t, status: 'delivered' as TransferStatus, deliveredAt: Date.now() } : t
      ),
      totalSentUsd: s.totalSentUsd + (s.transfers.find((t) => t.id === id)?.sendAmount ?? 0),
    })),
}));
