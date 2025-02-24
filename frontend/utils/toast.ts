import { toast, ToastOptions } from 'react-hot-toast';

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#363636',
    color: '#fff',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
  },
};

const successOptions: ToastOptions = {
  ...defaultOptions,
  icon: '✅',
  style: {
    ...defaultOptions.style,
    background: '#2e7d32', // Yeşil
  },
};

const errorOptions: ToastOptions = {
  ...defaultOptions,
  icon: '❌',
  style: {
    ...defaultOptions.style,
    background: '#d32f2f', // Kırmızı
  },
};

const warningOptions: ToastOptions = {
  ...defaultOptions,
  icon: '⚠️',
  style: {
    ...defaultOptions.style,
    background: '#ed6c02', // Turuncu
  },
};

const infoOptions: ToastOptions = {
  ...defaultOptions,
  icon: 'ℹ️',
  style: {
    ...defaultOptions.style,
    background: '#0288d1', // Mavi
  },
};

export const showToast = {
  success: (message: string) => toast.success(message, successOptions),
  error: (message: string) => toast.error(message, errorOptions),
  warning: (message: string) => toast(message, warningOptions),
  info: (message: string) => toast(message, infoOptions),
}; 