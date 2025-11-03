// lib/api.ts
import { getToken } from './tokenManager';

const API_BASE_URL = 'http://localhost:8000/api'; // This would come from import.meta.env.VITE_API_BASE_URL in a real setup

const makeRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const token = getToken();
    
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        let errorMessage = `API call failed: ${response.statusText}`;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.message || errorMessage;
        } catch (e) {
            // Ignore if the body is not JSON
        }
      throw new Error(errorMessage);
    }
    
    // Handle empty response body for 204 No Content etc.
    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        return null as T;
    }

    const data = await response.json();
    return data; 
};

export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => makeRequest(endpoint, { method: 'GET' }),
  post: async <T>(endpoint: string, body: any): Promise<T> => makeRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: async <T>(endpoint: string, body: any): Promise<T> => makeRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: async <T>(endpoint: string): Promise<T> => makeRequest(endpoint, { method: 'DELETE' }),
};
