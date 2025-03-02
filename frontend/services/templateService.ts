import { CV } from '../types/cv';
import ModernTemplate from '../templates/web/ModernTemplate';
import MinimalTemplate from '../templates/web/MinimalTemplate';

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