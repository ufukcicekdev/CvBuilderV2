import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    accessToken: string;
    refreshToken: string;
  }

  interface Session {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });

          const data = await response.json();

          if (response.ok && data) {
            // Backend'den gelen response'u next-auth user formatına dönüştür
            return {
              id: data.user.id.toString(),
              email: data.user.email,
              accessToken: data.access,
              refreshToken: data.refresh,
            };
          }
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // İlk login'de user objesi dolu gelir
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.userId = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // JWT'den session'a token'ları aktar
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user = {
        id: token.userId,
        email: token.email,
      };
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 saat
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);

// Session update handler
export async function POST(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { accessToken, refreshToken } = JSON.parse(req.body);
    
    // Session'ı güncelle
    const session = await getSession({ req });
    if (session) {
      session.accessToken = accessToken;
      session.refreshToken = refreshToken;
      await res.json(session);
    } else {
      res.status(401).json({ message: 'No session found' });
    }
  } catch (error) {
    console.error('Session update error:', error);
    res.status(500).json({ message: 'Error updating session' });
  }
} 