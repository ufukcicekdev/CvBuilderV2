import React, { createContext, useContext, useEffect, useState } from 'react';
import { setLanguage, SUPPORTED_LANGUAGES, initializeLanguage } from '../services/api';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan dil tercihini al ve API'yi ayarla
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    // console.log('Initial language:', savedLanguage); // Debug için
    setCurrentLanguage(savedLanguage);
    initializeLanguage(); // API'yi başlangıç diliyle ayarla
  }, []);

  const changeLanguage = (lang: string) => {
    if (lang in SUPPORTED_LANGUAGES) {
      // console.log('Changing language to:', lang);
      setCurrentLanguage(lang);
      setLanguage(lang);
      localStorage.setItem('selectedLanguage', lang);
    }
  };

  // Debug için mevcut dili logla
  // console.log('Current language in context:', currentLanguage);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 