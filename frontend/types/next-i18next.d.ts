import 'next-i18next';

declare module 'next-i18next' {
  interface UserConfig {
    i18n: {
      defaultLocale: string;
      locales: string[];
    };
    defaultNS: string;
    localePath: string;
    reloadOnPrerender: boolean;
    react: {
      useSuspense: boolean;
      wait: boolean;
    };
    serializeConfig: boolean;
    use: any[];
    fallbackLng: {
      default: string[];
      [key: string]: string[];
    };
    preload: string[];
    ns: string[];
    interpolation: {
      escapeValue: boolean;
    };
    detection: {
      order: string[];
      caches: string[];
    };
  }
}

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: {
        loading: string;
        error: string;
        success: string;
        save: string;
        cancel: string;
        edit: string;
        delete: string;
        next: string;
        previous: string;
        required: string;
        categories: string;
        invalidEmail: string;
        loadError: string;
        errors: {
          validationError: string;
          unknown: string;
          badRequest: string;
          unauthorized: string;
          forbidden: string;
          notFound: string;
          serverError: string;
        };
        [key: string]: string;
      };
      cv: {
        certificates: {
          title: string;
          name: string;
          issuer: string;
          issueDate: string;
          description: string;
          uploadFile: string;
          addMore: string;
          uploadError: string;
          uploadSuccess: string;
          [key: string]: string;
        };
        [key: string]: {
          [key: string]: string;
        };
      };
    };
  }
}

declare module 'next-i18next' {
  interface UseTranslationResponse<N extends keyof CustomTypeOptions['resources']> {
    t: (key: keyof CustomTypeOptions['resources'][N], options?: any) => string;
    i18n: any;
  }

  function useTranslation<N extends keyof CustomTypeOptions['resources']>(
    namespace?: N
  ): UseTranslationResponse<N>;
} 