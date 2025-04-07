import { CV } from '../types/cv';
import ModernTemplate from '../templates/web/ModernTemplate';
import MinimalTemplate from '../templates/web/MinimalTemplate';
import { CustomTemplateData } from '../components/pdf-templates/CustomTemplateRenderer';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';

export type TemplateId = 'modern-web' | 'minimal-web';

interface Template {
  id: TemplateId;
  name: string;
  description: string;
  image: string;
  component: React.FC<{ cv: CV }>;
}

export const TEMPLATES: Record<TemplateId, Template> = {
  'modern-web': {
    id: 'modern-web',
    name: 'Modern Web Template',
    description: 'Modern ve interaktif web tasarımı',
    image: 'https://placehold.co/600x400/png?text=Modern+Template',
    component: ModernTemplate
  },
  'minimal-web': {
    id: 'minimal-web',
    name: 'Minimal Web Template',
    description: 'Sade ve şık web tasarımı',
    image: 'https://placehold.co/600x400/png?text=Minimal+Template',
    component: MinimalTemplate
  }
};

// LocalStorage anahtarı
const STORAGE_KEY = 'cv_builder_custom_templates';

/**
 * Şablon işlemleri için servis
 */
export const templateService = {
  /**
   * Kullanıcının özel şablonlarını getir
   * @returns Özel şablonlar listesi
   */
  getCustomTemplates: async (): Promise<CustomTemplateData[]> => {
    try {
      // Mevcut kullanıcı için özel endpoint kullanıyoruz
      // console.log('Calling API to get templates for current user');
      // Django REST framework viewset action URL yapısı: /viewset-path/action-name/
      const response = await axiosInstance.get('/api/templates/templates/for_current_user/');
      // console.log('API response for templates:', response.data);
      return response.data;
    } catch (error) {
      console.error('Özel şablonlar getirilirken hata oluştu:', error);
      // API hatası durumunda boş dizi döndür, kullanıcıya UI'da bildirim gösterilmesi gerekebilir
      return [];
    }
  },

  /**
   * Yeni bir özel şablon kaydet
   * @param templateData Şablon verileri
   * @returns Kaydedilen şablon
   */
  saveCustomTemplate: async (templateData: any): Promise<CustomTemplateData> => {
    // Şablon adı yoksa varsayılan bir ad oluştur
    if (!templateData.name) {
      templateData.name = `Şablon ${new Date().toLocaleDateString()}`;
    }
    
    try {
      // console.log('Sending template data to API:', JSON.stringify(templateData));
      
      // API yanıt vermeden önce işlemin başladığını bildir
      toast.loading('Şablon kaydediliyor...', { id: 'saving-template' });
      
      // Django REST framework viewset endpoint yapısı
      const endpoint = '/api/templates/templates/';
      // console.log(`Using endpoint: ${endpoint} for template save`);
      
      // Kimlik doğrulama token'ını kontrol et ve logla
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      if (!token) {
        console.warn('No authentication token found. This request might fail due to authentication issues.');
      } else {
        // console.log('Authentication token is present, proceeding with API request.');
      }
      
      const response = await axiosInstance.post(endpoint, templateData);
      // console.log('Template save response:', response.data);
      
      // Başarılı kaydetme bildirimi
      toast.success('Şablon başarıyla kaydedildi!', { id: 'saving-template' });
      return response.data;
    } catch (error: any) {
      console.error('Özel şablon kaydedilirken hata oluştu:', error);
      // API yanıtını detaylı logla
      if (error.response) {
        console.error('API error response:', error.response.status, error.response.data);
      }
      
      // Daha açıklayıcı hata mesajı gösterelim
      if (error.response) {
        // API hata durumu
        const statusCode = error.response.status;
        let errorMessage = '';
        
        switch(statusCode) {
          case 401:
            errorMessage = 'Oturum süresi dolmuş. Lütfen sayfayı yenileyip tekrar giriş yapın.';
            break;
          case 403:
            errorMessage = 'Bu işlemi yapma yetkiniz yok.';
            break;
          case 400:
            errorMessage = error.response.data?.detail || 'Geçersiz şablon verileri. Lütfen bilgilerinizi kontrol edin.';
            break;
          case 500:
            errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
            break;
          default:
            errorMessage = error.response.data?.detail || 'Şablon kaydedilirken bir hata oluştu';
        }
        
        // Hata bildirimini göster
        toast.error(errorMessage, { id: 'saving-template' });
        throw new Error(errorMessage);
      }
      // Hata bildirimini göster
      toast.error('Şablon kaydedilirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.', { id: 'saving-template' });
      throw new Error('Şablon kaydedilirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
    }
  },

  /**
   * Var olan bir şablonu güncelle
   * @param templateId Şablon ID'si
   * @param templateData Güncellenecek şablon verileri
   * @returns Güncellenmiş şablon
   */
  updateCustomTemplate: async (templateId: string, templateData: any): Promise<CustomTemplateData> => {
    try {
      const response = await axiosInstance.put(`/api/templates/templates/${templateId}/`, templateData);
      return response.data;
    } catch (error: any) {
      console.error('Şablon güncellenirken hata oluştu:', error);
      if (error.response) {
        throw new Error(error.response.data?.detail || 'Şablon güncellenirken bir hata oluştu');
      }
      throw new Error('Şablon güncellenirken bir hata oluştu');
    }
  },

  /**
   * Şablonu sil
   * @param templateId Şablon ID'si
   * @returns Silme işlemi başarılı ise true
   */
  deleteCustomTemplate: async (templateId: string): Promise<boolean> => {
    const toastId = 'deleting-template'; // Tüm toastlar için sabit ID
    
    try {
      // Önce templateId'nin geçerli olup olmadığını kontrol et
      if (!templateId) {
        console.error('Invalid templateId provided for deletion:', templateId);
        toast.error('Geçersiz şablon ID\'si.', { id: toastId });
        return false;
      }

      // API yanıt vermeden önce işlemin başladığını bildir
      toast.loading('Şablon siliniyor...', { id: toastId });
      
      // Direkt olarak veritabanından gelen ID'yi kullanarak deleteUrl oluştur
      // ID formatı: "template-1743450745896" şeklinde olmalı
      const deleteUrl = `/api/templates/templates/${templateId}/`;
      // console.log(`Delete URL: ${deleteUrl}`);
      // console.log(`Attempting to delete template with ID: "${templateId}" (type: ${typeof templateId})`);
      
      // Kimlik doğrulama token'ını kontrol et ve logla
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      if (!token) {
        console.warn('No authentication token found. Delete request might fail due to authentication issues.');
        toast.error('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.', { id: toastId });
        return false;
      } else {
        // console.log('Authentication token is present, proceeding with delete request.');
      }
      
      // API isteğini gönder ve yanıtı logla - responseType: 'text' ekleyerek ham yanıtı görelim
      const response = await axiosInstance.delete(deleteUrl, { responseType: 'text' });
      // console.log('Delete template response:', response.status, response.data);
      
      // Başarılı silme bildirimi
      toast.success('Şablon başarıyla silindi!', { id: toastId });
      return true;
    } catch (error: any) {
      console.error('Şablon silinirken hata oluştu:', error);
      
      // API yanıtını detaylı logla
      if (error.response) {
        console.error('API error response (delete):', error.response.status, error.response.data);
        console.error('Request URL that failed:', error.config?.url);
        
        // Request headers ve request body'yi logla
        console.error('Request headers:', error.config?.headers);
        
        // Canlı debug için daha detaylı bilgi ekle
        console.error('Complete error object for debugging:', JSON.stringify({
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        }, null, 2));
      }
      
      // Loading toastını kapat ve hata mesajını göster
      // Daha açıklayıcı hata mesajı gösterelim
      if (error.response) {
        // API hata durumu
        const statusCode = error.response.status;
        let errorMessage = '';
        
        switch(statusCode) {
          case 401:
            errorMessage = 'Oturum süresi dolmuş. Lütfen sayfayı yenileyip tekrar giriş yapın.';
            break;
          case 403:
            errorMessage = 'Bu şablonu silme yetkiniz yok.';
            break;
          case 404:
            errorMessage = `Şablon bulunamadı (ID: ${templateId}). Daha önce silinmiş olabilir veya ID formatı hatalı olabilir.`;
            break;
          case 500:
            errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
            break;
          default:
            errorMessage = error.response.data?.detail || 'Şablon silinirken bir hata oluştu';
        }
        
        // Hata bildirimini göster - Aynı ID'yi kullanarak loading toast'unu otomatik kapat
        toast.error(errorMessage, { id: toastId });
        throw new Error(errorMessage);
      }
      
      // API isteği dahi gönderilemedi (ağ hatası vb.)
      toast.error('Şablon silinirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.', { id: toastId });
      throw new Error('Şablon silinirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
    }
  },

  /**
   * Belirli bir şablonu getir
   * @param templateId Şablon ID'si 
   * @returns Şablon verisi
   */
  getCustomTemplate: async (templateId: string): Promise<CustomTemplateData> => {
    try {
      const response = await axiosInstance.get(`/api/templates/templates/${templateId}/`);
      return response.data;
    } catch (error: any) {
      console.error('Şablon getirilirken hata oluştu:', error);
      if (error.response) {
        throw new Error(error.response.data?.detail || 'Şablon getirilirken bir hata oluştu');
      }
      throw new Error('Şablon getirilirken bir hata oluştu');
    }
  }
};

export default templateService;

// Yerel depolamadan şablonları getiren yardımcı fonksiyon
function getTemplatesFromLocalStorage(): CustomTemplateData[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedTemplates = localStorage.getItem(STORAGE_KEY);
    return storedTemplates ? JSON.parse(storedTemplates) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

// Şablonları yerel depolamaya kaydeden yardımcı fonksiyon
function saveTemplatesToLocalStorage(templates: CustomTemplateData[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
} 