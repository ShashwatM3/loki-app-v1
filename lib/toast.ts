import { toast as sonnerToast } from 'sonner-native';

/**
 * Thin wrapper matching the `sonner` API surface the website uses
 * (toast.success / toast.error / toast.info / toast.message).
 */
export const toast = {
  success: (title: string, opts?: { description?: string }) =>
    sonnerToast.success(title, opts?.description ? { description: opts.description } : undefined),
  error: (title: string, opts?: { description?: string }) =>
    sonnerToast.error(title, opts?.description ? { description: opts.description } : undefined),
  info: (title: string, opts?: { description?: string }) =>
    sonnerToast.info(title, opts?.description ? { description: opts.description } : undefined),
  message: (title: string, opts?: { description?: string; style?: object; className?: string }) =>
    sonnerToast(title, opts?.description ? { description: opts.description } : undefined),
};
