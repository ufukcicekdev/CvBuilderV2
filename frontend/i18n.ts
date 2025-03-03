import i18n, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Tüm dil dosyalarını import et
import commonTR from './public/locales/tr/common.json';
import commonEN from './public/locales/en/common.json';
import commonES from './public/locales/es/common.json';
import commonZH from './public/locales/zh/common.json';
import commonAR from './public/locales/ar/common.json';
import commonHI from './public/locales/hi/common.json';

const resources = {
  tr: {
    common: {
      auth: {
        login: 'Giriş Yap',
        register: 'Kayıt Ol',
      },
      navigation: {
        next: 'İleri',
        previous: 'Geri'
      },
      // ... diğer çeviriler
    },
    cv: {
      certificates: {
        title: 'Sertifikalar',
        name: 'Sertifika Adı',
        issuer: 'Veren Kurum',
        date: 'Tarih',
        url: 'URL',
        uploadFile: 'Dosya Yükle',
        fileUploaded: 'Dosya Yüklendi',
        fileHelperText: 'PDF, JPG veya PNG dosyası yükleyebilirsiniz'
      }
    }
  },
  en: { common: commonEN },
  es: { common: commonES },
  zh: { common: commonZH },
  ar: { common: commonAR },
  hi: { common: commonHI },
};

const i18nConfig: InitOptions = {
  resources,
  lng: 'tr',
  fallbackLng: 'tr',
  supportedLngs: ['tr', 'en', 'zh', 'es', 'hi', 'ar'],
  debug: process.env.NODE_ENV === 'development',
  defaultNS: 'common',
  ns: ['common'],
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  }
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init(i18nConfig);

export default i18n; 