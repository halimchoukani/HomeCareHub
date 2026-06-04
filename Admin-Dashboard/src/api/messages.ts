import { apiClient } from './client';

export const sendDirectMessage = async (userId: string, message: string, token: string): Promise<any> => {
  const { data } = await apiClient.post('/admin/message', { userId, message }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const sendGlobalBroadcast = async (message: string, token: string): Promise<any> => {
  const { data } = await apiClient.post('/admin/message', { message }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};
