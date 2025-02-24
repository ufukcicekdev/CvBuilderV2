export interface User {
  id: number;
  email: string;
  user_type: 'jobseeker' | 'employer';
  username: string;
} 