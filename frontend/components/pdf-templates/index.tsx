import { PDFTemplateProps } from './types';
import dynamic from 'next/dynamic';

// Şablonları sunucu tarafında render etmemek için dynamic import kullanıyoruz
const Template1 = dynamic(() => import('./Template1'), { ssr: false });
const Template2 = dynamic(() => import('./Template2'), { ssr: false });

export { Template1, Template2 };
export type { PDFTemplateProps };

interface TemplateMap {
  [key: string]: React.ComponentType<PDFTemplateProps>;
}

// Şablon ID'leri ve bileşenler arasında bir harita
export const PdfTemplates: TemplateMap = {
  'template1': Template1,
  'template2': Template2,
};

// Şablonlar hakkında bilgi
export const templateInfo = {
  'template1': {
    name: 'Modern Template',
    description: 'Temiz ve minimalist düzen, mavi vurgular.',
    previewImage: '/images/templates/template1.jpg',
  },
  'template2': {
    name: 'Professional Template',
    description: 'İki sütunlu modern düzen, özelleştirilebilir üst bilgi.',
    previewImage: '/images/templates/template2.jpg',
  },
};

// Belirli bir ID'ye dayalı şablonu almak için yardımcı fonksiyon
export const getTemplateById = (id: string) => {
  return PdfTemplates[id] || Template1; // Varsayılan olarak Template1'i döndür
}; 