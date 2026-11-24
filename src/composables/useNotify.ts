import { useToast } from 'openvue/usetoast';

export type NotifyKind = 'success' | 'error' | 'info' | 'warn';

export interface NotifyOptions {
  /** small second line under the title */
  detail?: string;
  /** ms; errors stay until closed when omitted */
  life?: number;
}

/**
 * Replacement for Quasar's $q.notify: shows an OpenVue Toast (MA/Toast in
 * Figma). Success/info disappear after 5 s, errors stay until closed.
 */
export function useNotify() {
  const toast = useToast();
  const show = (severity: NotifyKind, summary: string, opts: NotifyOptions = {}) => {
    const life = opts.life ?? (severity === 'error' ? undefined : 5000);
    toast.add({ severity, summary, ...(opts.detail !== undefined ? { detail: opts.detail } : {}), ...(life !== undefined ? { life } : {}) });
  };
  return {
    success: (summary: string, opts?: NotifyOptions) => show('success', summary, opts),
    error: (summary: string, opts?: NotifyOptions) => show('error', summary, opts),
    info: (summary: string, opts?: NotifyOptions) => show('info', summary, opts),
    warn: (summary: string, opts?: NotifyOptions) => show('warn', summary, opts),
  };
}
