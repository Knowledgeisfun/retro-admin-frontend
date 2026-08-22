import { API_BASE_URL } from './api';

/**
 * A centralized fetch wrapper that automatically attaches 
 * the Bearer token and JSON headers to every request.
 */
export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle unauthorized globally if needed
  if (response.status === 401 || response.status === 403) {
    console.error("API request blocked or unauthorized:", endpoint);
  }

  return response;
};