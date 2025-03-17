export interface PersonalInfo {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  address?: string;
  title?: string;
  summary?: string;
  photo?: string;
  birth_date?: string;
  description?: string;
}

export interface Experience {
  id?: string;
  position?: string;
  company?: string;
  location?: string;
  start_date?: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string;
}

export interface Education {
  id?: string;
  school?: string;
  degree?: string;
  field?: string;
  location?: string;
  start_date?: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string;
}

export interface Skill {
  id?: string;
  name?: string;
  level?: number; // 1-5
  description?: string;
}

export interface Language {
  id?: string;
  name?: string;
  level?: number; // 1-5
}

export interface Certificate {
  id?: string;
  name?: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface PDFTemplateProps {
  data: {
    id?: string;
    title?: string;
    personal_info?: {
      first_name?: string;
      last_name?: string;
      full_name?: string;
      email?: string;
      phone?: string;
      location?: string;
      website?: string;
      linkedin?: string;
      github?: string;
      title?: string;
      summary?: string;
      photo?: string; // Profile picture field
    };
    experience?: Array<{
      id?: string;
      company: string;
      position: string;
      start_date: string;
      end_date?: string;
      location?: string;
      description: string;
    }>;
    education?: Array<{
      id?: string;
      school: string;
      degree: string;
      field_of_study?: string;
      start_date: string;
      end_date?: string;
      location?: string;
      description?: string;
    }>;
    skills?: Array<{
      id?: string;
      name: string;
      level?: number;
    }>;
    languages?: Array<{
      id?: string;
      name: string;
      level?: number;
    }>;
    certificates?: Array<{
      id?: string;
      name: string;
      issuer?: string;
      date?: string;
      description?: string;
    }>;
    i18n?: Record<string, string>;
  };
  language?: string;
  translations?: Record<string, string>;
}

export type CVData = PDFTemplateProps['data']; 