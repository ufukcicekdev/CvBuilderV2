export interface BaseFormProps {
  cvId: string;
  onValidationChange: (isValid: boolean) => void;
  initialData?: any;
}

export interface PersonalInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  birth_date: string;
  gender: string;
  profile_picture?: string;
  summary?: string;
}

export interface Experience {
  id?: number;
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description: string;
  location?: string;
}

export interface Education {
  id?: number;
  school: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description?: string;
  location?: string;
}

export interface Skill {
  id?: number;
  name: string;
  level: number;
  category?: string;
}

export interface Language {
  id?: number;
  name: string;
  level: string;
  certificate?: string;
}

export interface Certificate {
  id?: number;
  name: string;
  issuer: string;
  date: string;
  description?: string;
  document?: File;
  documentUrl?: string;
}

export interface PersonalInfoFormProps extends BaseFormProps {
  initialData?: PersonalInfo;
}

export interface ExperienceFormProps extends BaseFormProps {
  initialData?: Experience[];
}

export interface EducationFormProps extends BaseFormProps {
  initialData?: Education[];
}

export interface SkillsFormProps extends BaseFormProps {
  initialData?: Skill[];
}

export interface LanguagesFormProps extends BaseFormProps {
  initialData?: Language[];
}

export interface CertificatesFormProps extends BaseFormProps {
  initialData?: Certificate[];
}

export interface VideoFormProps extends BaseFormProps {
  initialData?: {
    video_url: string | null;
    video_description: string | null;
  };
}

export interface TemplatePreviewFormProps extends BaseFormProps {
  initialData?: any;
}

// ... diğer form tipleri 