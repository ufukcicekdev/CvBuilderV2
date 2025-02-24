export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  post_count?: number;
}

export interface BlogTranslation {
  language: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

export interface BlogPost {
  id: number;
  category: BlogCategory;
  author: any;
  created_at: string;
  featured_image: string | null;
  current_translation: BlogTranslation;
  translations?: BlogTranslation[];
  view_count?: number;
}

export interface BlogComment {
  id: number;
  user: string;
  content: string;
  created_at: string;
  replies: BlogComment[];
} 