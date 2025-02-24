const path = require('path');

/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'tr',
    locales: ['tr', 'en', 'zh', 'es', 'hi', 'ar'],
  },
  defaultNS: 'common',
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: true,
  react: { 
    useSuspense: false,
    wait: true
  },
  serializeConfig: false,
  use: [],
  fallbackLng: {
    default: ['tr'],
    'tr': ['tr'],
    'en': ['en'],
    'es': ['es'],
    'zh': ['zh'],
    'ar': ['ar'],
    'hi': ['hi']
  },
  preload: ['tr', 'en', 'es', 'zh', 'ar', 'hi'],
  ns: ['common'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false
  },
  detection: {
    order: ['cookie', 'localStorage', 'path', 'domain'],
    caches: ['cookie', 'localStorage']
  }
} 