import { apiClient } from './client';
import { DashboardPayload } from '../types';

export const fetchDashboardData = async (token: string): Promise<DashboardPayload> => {
  const { data } = await apiClient.get('/admin/dashboard', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};
