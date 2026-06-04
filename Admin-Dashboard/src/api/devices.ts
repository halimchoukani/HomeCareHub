import { apiClient } from './client';
import { Device } from '../types';

export const fetchDevices = async (token: string): Promise<Device[]> => {
  const { data } = await apiClient.get('/admin/devices', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const deleteDevice = async (deviceId: string, token: string): Promise<void> => {
  await apiClient.delete(`/admin/devices/${deviceId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const createDevice = async (name: string, token: string): Promise<void> => {
  await apiClient.post('/devices/', { name }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
