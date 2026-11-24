import type { AccountInfo, Meta, OutboxFilter } from '@brifle/brifle-sdk';
import Brifle from 'src/services/node/Brifle';
import type { StatusType } from 'components/ui/StatusTag.vue';

/** Page size of the outbox endpoint (the server returns 25 documents per page). */
export const OUTBOX_PAGE_SIZE = 25;

export type DocumentType = 'letter' | 'invoice' | 'contract';
export const DOCUMENT_TYPES: DocumentType[] = ['letter', 'invoice', 'contract'];

export interface OutboxQuery {
  subject?: string;
  type?: DocumentType | 'all';
}

export interface OutboxPage {
  values: Meta[];
  total: number;
  receivers: Map<string, AccountInfo>;
}

/**
 * Loads one page of the outbox (active documents) and the account info of every receiver on it.
 * Receivers that cannot be resolved are left out of the map.
 */
export async function loadOutboxPage(apiId: string, tenantId: string, query: OutboxQuery, page: number): Promise<OutboxPage> {
  const filter: OutboxFilter = { state: ['active'], subject: query.subject ?? '' };
  if (query.type && query.type !== 'all') filter.type = query.type;

  const res = await Brifle.mailbox().getOutbox(apiId, tenantId, filter, page);
  const values = res.isSuccess ? res.data!.results : [];
  const total = res.isSuccess ? res.data!.total : 0;

  const receivers = new Map<string, AccountInfo>();
  const ids = Array.from(new Set(values.map((item) => item.receiver)));
  await Promise.all(ids.map(async (id) => {
    try {
      const receiver = await Brifle.accounts().getById(apiId, id);
      if (receiver?.isSuccess && receiver.data != null) receivers.set(id, receiver.data);
    } catch (e) {
      console.error('Could not load receiver', id, e);
    }
  }));
  return { values, total, receivers };
}

/** Display name of a receiver account, or `null` when unknown. */
export function receiverName(receiver: AccountInfo | null | undefined): string | null {
  if (receiver == null) return null;
  if (receiver.type === 'private') return `${receiver.first_name} ${receiver.last_name}`;
  return receiver.company_name;
}

export type OutboxState = 'read' | 'delivered' | 'sent';

/** Delivery state of a sent document from the fields the API returns (`read`, `delivered`). */
export function outboxState(meta: { read: boolean; delivered: boolean }): OutboxState {
  if (meta.read) return 'read';
  if (meta.delivered) return 'delivered';
  return 'sent';
}

export const STATE_TAG: Record<OutboxState, StatusType> = {
  read: 'read',
  delivered: 'delivered',
  sent: 'processing',
};

export function isDocumentType(value: string | undefined): value is DocumentType {
  return DOCUMENT_TYPES.includes(value as DocumentType);
}

/** e.g. 214 KB / 1,2 MB */
export function formatSize(bytes: number | undefined): string {
  if (bytes == null || Number.isNaN(bytes)) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toLocaleString('de-DE', { maximumFractionDigits: 1 })} MB`;
}

/** e.g. 24.11.26 · 09:12 */
export function formatDateTime(value: string | Date | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() <= 0) return '';
  const day = date.toLocaleDateString('de-DE', { year: '2-digit', month: '2-digit', day: '2-digit' });
  const time = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${time}`;
}
