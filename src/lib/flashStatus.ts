import type { UIKey } from '../i18n/ui';

export type FlashStatus = 'available' | 'reserved' | 'taken';

export const FLASH_STATUS_COLORS: Record<FlashStatus, string> = {
  available: '#6E8B5A',
  reserved: '#C9A15A',
  taken: '#A85C48',
};

export const FLASH_STATUS_LABEL_KEY: Record<FlashStatus, UIKey> = {
  available: 'flash.statusAvailable',
  reserved: 'flash.statusReserved',
  taken: 'flash.statusTaken',
};

/** Taken designs sort after everything else; otherwise order is untouched. */
export function compareFlashOrder(a: { order: number; status?: FlashStatus }, b: { order: number; status?: FlashStatus }): number {
  const rank = (s?: FlashStatus) => (s === 'taken' ? 1 : 0);
  return rank(a.status) - rank(b.status) || a.order - b.order;
}
