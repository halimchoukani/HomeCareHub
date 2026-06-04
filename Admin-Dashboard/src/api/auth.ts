import { apiClient } from './client';

export const loginAdmin = async (email: string, password: string): Promise<{ token: string }> => {
  const { data } = await apiClient.post('/admin/login', { email, password });
  return data;
};
