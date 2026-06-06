import { apiClient } from './client';

export const fetchLogs = async (token: string) => {
  const response = await apiClient.get('/admin/logs', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
