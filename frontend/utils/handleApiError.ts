import { AxiosError } from 'axios';
import { TFunction } from 'next-i18next';

export const handleApiError = (error: AxiosError, t: TFunction) => {
  if (error.response?.data?.error_key) {
    // Backend'den gelen hata key'ini çevir
    return t(error.response.data.error_key);
  }

  // Genel hata durumları
  switch (error.response?.status) {
    case 400:
      return t('common.errors.badRequest');
    case 401:
      return t('common.errors.unauthorized');
    case 403:
      return t('common.errors.forbidden');
    case 404:
      return t('common.errors.notFound');
    case 500:
      return t('common.errors.serverError');
    default:
      return t('common.errors.unknown');
  }
}; 