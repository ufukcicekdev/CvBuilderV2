import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: {
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
          uploading: string;
        };
        cv: {
          video: {
            title: string;
            selectVideo: string;
            dragDrop: string;
            maxSize: string;
            fileTooLarge: string;
            invalidFileType: string;
            uploading: string;
            deleteError: string;
            saveError: string;
            errorLoading: string;
            description: string;
          };
        };
      };
    };
  }
} 