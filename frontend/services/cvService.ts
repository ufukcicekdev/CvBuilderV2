import axios from 'axios';
import axiosInstance from '../utils/axios';

export const cvService = {
  getCv: (id: string) => 
    axios.get(`/api/cvs/${id}/`),
  
  updatePersonalInfo: (id: string, personalInfo: any) =>
    axios.patch(`/api/cvs/${id}/`, { personal_info: personalInfo }),
  
  updateStep: (id: string, step: number) =>
    axios.patch(`/api/cvs/${id}/update_step/`, { current_step: step }),
  
  // Diğer CV ile ilgili API çağrıları...
  
  // CV'leri listele
  listCVs: () => 
    axiosInstance.get('/api/cvs/'),
  
  // CV sil
  deleteCV: (id: string) =>
    axiosInstance.delete(`/api/cvs/${id}/`),
  
  // Yeni CV oluştur
  createCV: (data: any) =>
    axiosInstance.post('/api/cvs/', data),
}; 