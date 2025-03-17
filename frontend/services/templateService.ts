import { CV } from '../types/cv';
import ModernTemplate from '../templates/web/ModernTemplate';
import MinimalTemplate from '../templates/web/MinimalTemplate';
import { CustomTemplateData } from '../components/pdf-templates/TemplateBuilder';
import { apiService } from './apiService';

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

export const templateService = {
  /**
   * Kullanıcının kaydettiği tüm özel şablonları getirir
   * Backend'den getirmeye çalışır, başarısız olursa yerel depolamadan getirir
   */
  getCustomTemplates: async (userId?: string): Promise<CustomTemplateData[]> => {
    try {
      if (userId) {
        // API'den kullanıcıya ait şablonları getir
        const response = await apiService.get(`/templates?userId=${userId}`);
        return response.data;
      }
      
      // Kullanıcı kimliği yoksa yerel depolamadan getir
      return getTemplatesFromLocalStorage();
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Hata durumunda yerel depolamadan getir
      return getTemplatesFromLocalStorage();
    }
  },
  
  /**
   * Yeni bir özel şablon kaydeder veya mevcut bir şablonu günceller
   */
  saveCustomTemplate: async (template: CustomTemplateData, userId?: string): Promise<CustomTemplateData> => {
    try {
      if (userId) {
        // Şablonu API üzerinden kaydet
        const method = template.id.startsWith('template-') ? 'post' : 'put';
        const endpoint = method === 'post' ? '/templates' : `/templates/${template.id}`;
        
        const response = await apiService[method](endpoint, { 
          ...template,
          userId 
        });
        
        // API'den gelen güncellenmiş şablonu döndür
        return response.data;
      }
      
      // API yoksa yerel depolamaya kaydet
      const templates = getTemplatesFromLocalStorage();
      
      // Mevcut şablon varsa güncelle, yoksa ekle
      const existingIndex = templates.findIndex(t => t.id === template.id);
      if (existingIndex >= 0) {
        templates[existingIndex] = {
          ...template,
          updatedAt: new Date().toISOString()
        };
      } else {
        templates.push({
          ...template,
          id: template.id || `template-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Yerel depolamaya kaydet
      saveTemplatesToLocalStorage(templates);
      
      // Kaydedilen şablonu döndür
      return template;
    } catch (error) {
      console.error('Error saving template:', error);
      
      // Hata durumunda yerel depolamaya kaydet
      const templates = getTemplatesFromLocalStorage();
      
      // Güncelle veya ekle
      const existingIndex = templates.findIndex(t => t.id === template.id);
      if (existingIndex >= 0) {
        templates[existingIndex] = {
          ...template,
          updatedAt: new Date().toISOString()
        };
      } else {
        templates.push({
          ...template,
          id: template.id || `template-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Yerel depolamaya kaydet
      saveTemplatesToLocalStorage(templates);
      
      return template;
    }
  },
  
  /**
   * Bir şablonu siler
   */
  deleteCustomTemplate: async (templateId: string, userId?: string): Promise<boolean> => {
    try {
      if (userId) {
        // API üzerinden şablonu sil
        await apiService.delete(`/templates/${templateId}`);
        return true;
      }
      
      // Yerel depolamadan sil
      const templates = getTemplatesFromLocalStorage().filter(t => t.id !== templateId);
      saveTemplatesToLocalStorage(templates);
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      
      // Hata durumunda yerel depolamadan sil
      const templates = getTemplatesFromLocalStorage().filter(t => t.id !== templateId);
      saveTemplatesToLocalStorage(templates);
      return true;
    }
  }
};

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