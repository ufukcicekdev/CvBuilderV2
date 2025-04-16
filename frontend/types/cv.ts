export interface CV {
  id: number;
  user_id: number;
  title: string;
  description: string;
  personal_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    birth_date: string;
    photo?: string;
    title?: string;
    location?: string;
    full_name?: string;
    description?: string;
    summary?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  video_info?: {
    video_url: string | null;
    description: string | null;
    type: string | null;
    uploaded_at: string | null;
  };
  experience: Array<{
    id: number;
    position: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string | null;
    description: string;
  }>;
  education: Array<{
    id: number;
    degree: string;
    school: string;
    location: string;
    start_date: string;
    end_date: string | null;
    description: string;
  }>;
  skills: Array<{
    id: number;
    name: string;
    level?: string;
  }>;
  languages: Array<{
    id: number;
    name: string;
    level: string;
  }>;
  certificates: Array<{
    id: number;
    name: string;
    issuer: string;
    date?: string;
    description?: string;
    documentUrl?: string;
    document_type?: string;
  }>;
  created_at: string;
  updated_at: string;
  language: string;
} 