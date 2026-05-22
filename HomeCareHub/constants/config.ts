/**
 * Central configuration file for HomeCareHub
 */

export const API_IP = 'localhost';
export const API_PORT = '8000';

export const API_BASE_URL = `http://${API_IP}:${API_PORT}/api`;

export const ENDPOINTS = {
  login: `${API_BASE_URL}/auth/login/`,
  register: `${API_BASE_URL}/auth/register/`,
  services: `${API_BASE_URL}/services/`,
  personnes: `${API_BASE_URL}/personnes/`,
  ajouterPersonne: `${API_BASE_URL}/personnes/ajouter/`,
  supprimerPersonne: (id: string | number) => `${API_BASE_URL}/personnes/${id}/supprimer/`,
  deviceControl: `${API_BASE_URL}/device/control/`,
};
