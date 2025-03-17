import Template1 from './Template1';
import Template2 from './Template2';
import { CustomTemplateData } from './TemplateBuilder';

// Şablon bilgileri
export const templateInfo = {
  template1: {
    id: 'template1',
    name: 'Classic CV',
    description: 'Clean and professional template with a traditional layout'
  },
  template2: {
    id: 'template2',
    name: 'Modern CV',
    description: 'Contemporary design with a sleek layout'
  }
};

// ID'ye göre şablon bileşenini getir
export const getTemplateById = (id: string) => {
  // Eğer geçerli bir şablon ID'si değilse, varsayılan olarak Template1'i kullan
  if (!id || !['template1', 'template2'].includes(id)) {
    return Template1;
  }
  
  const templates = {
    template1: Template1,
    template2: Template2
  };
  
  return templates[id as keyof typeof templates];
};

export { default as Template1 } from './Template1';
export { default as Template2 } from './Template2';
export { default as TemplateBuilder } from './TemplateBuilder';
export { default as CustomTemplateRenderer } from './CustomTemplateRenderer'; 