import { NextApiRequest, NextApiResponse } from 'next';
import axiosInstance from '../../../../services/axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cvId } = req.query;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await axiosInstance.delete(`/api/cv/${cvId}/video/`);
    return res.status(response.status).json(response.data);
  } catch (error: any) {
    return res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
} 