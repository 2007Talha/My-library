export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: Toast['type'] = 'success') {
  const toast: Toast = { id: Date.now().toString(), message, type };
  toastListeners.forEach(l => l(toast));
}

