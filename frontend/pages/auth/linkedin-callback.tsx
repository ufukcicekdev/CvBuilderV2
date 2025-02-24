'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, CircularProgress } from '@mui/material';
import { useLinkedIn } from 'react-linkedin-login-oauth2';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function LinkedInCallback() {
  const router = useRouter();
  const { linkedInLogin } = useLinkedIn({
    clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
    redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/linkedin-callback`,
    onSuccess: async (code) => {
      try {
        const response = await axios.post('/api/auth/linkedin', { code });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', 'jobseeker');
        router.push('/dashboard');
        toast.success('Login successful!');
      } catch (error) {
        toast.error('Login failed');
        router.push('/login');
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error('Login failed');
      router.push('/login');
    },
  });

  useEffect(() => {
    if (router.query.code) {
      linkedInLogin();
    }
  }, [router.query.code, linkedInLogin]);

  return (
    <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Container>
  );
} 