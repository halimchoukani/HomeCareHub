import { apiClient } from './client';
import { User } from '../types';

export const fetchUsers = async (token: string): Promise<User[]> => {
  const { data } = await apiClient.get('/admin/users', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const deleteUser = async (userId: string, token: string): Promise<void> => {
  await apiClient.delete(`/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
