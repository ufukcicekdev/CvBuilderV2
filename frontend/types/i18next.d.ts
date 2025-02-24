import 'i18next';
import commonTR from '../public/locales/tr/common.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof commonTR;
    };
  }
} 