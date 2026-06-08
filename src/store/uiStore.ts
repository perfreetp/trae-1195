import { create } from 'zustand';
import type { ToastState, ToastType } from '@/types';

interface UIState {
  sidebarOpen: boolean;
  showLoadingOverlay: boolean;
  toast: ToastState;
}

interface UIActions {
  toggleSidebar: (open?: boolean) => void;
  setLoadingOverlay: (show: boolean) => void;
  showToast: (msg: string, type?: ToastType) => void;
  hideToast: () => void;
}

let toastTimer: number | null = null;

const initialToast: ToastState = {
  visible: false,
  message: '',
  type: 'info',
};

export const useUIStore = create<UIState & UIActions>((set, get) => ({
  sidebarOpen: false,
  showLoadingOverlay: false,
  toast: initialToast,

  toggleSidebar: (open?: boolean) => {
    set((state) => ({
      sidebarOpen: typeof open === 'boolean' ? open : !state.sidebarOpen,
    }));
  },

  setLoadingOverlay: (show: boolean) => {
    set({ showLoadingOverlay: show });
  },

  showToast: (msg: string, type: ToastType = 'info') => {
    if (toastTimer) {
      window.clearTimeout(toastTimer);
      toastTimer = null;
    }
    set({ toast: { visible: true, type, message: msg } });
    toastTimer = window.setTimeout(() => {
      if (get().toast.visible) {
        get().hideToast();
      }
    }, 3000);
  },

  hideToast: () => {
    set({ toast: { ...initialToast } });
    if (toastTimer) {
      window.clearTimeout(toastTimer);
      toastTimer = null;
    }
  },
}));
