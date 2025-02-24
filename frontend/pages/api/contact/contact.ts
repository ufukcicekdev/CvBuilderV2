import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await axios.post(`${API_URL}/api/contact/contact/`, req.body, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Contact form error:', error);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Something went wrong'
    });
  }
} 