const path = require('path')

/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'tr',
    locales: ['tr', 'en', 'es', 'zh', 'ar', 'hi', 'de'],
    localeDetection: false
  },
  fallbackLng: {
    default: ['tr'],
    tr: ['tr'],
    en: ['en'],
    es: ['es'],
    zh: ['zh'],
    ar: ['ar'],
    hi: ['hi'],
    de: ['de']
  },
  defaultNS: 'common',
  localePath: path.resolve('./public/locales'),
  ns: ['common'],
  react: { 
    useSuspense: false 
  }
} 