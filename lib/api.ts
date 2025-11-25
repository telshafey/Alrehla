
import { getToken, clearToken } from './tokenManager';

const API_BASE_URL = 'http://localhost:8000/api';

export class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

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

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

        if (!response.ok) {
            // Handle 401 Unauthorized globally
            if (response.status === 401) {
                clearToken();
                // Optional: Redirect to login if not already there
                if (!window.location.hash.includes('/account')) {
                    window.location.hash = '#/account';
                }
                throw new ApiError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.', 401);
            }

            let errorMessage = `فشل الطلب: ${response.statusText}`;
            let errorData = null;

            try {
                const errorBody = await response.json();
                errorMessage = errorBody.message || errorMessage;
                errorData = errorBody;
            } catch (e) {
                // Ignore if body is not JSON
            }

            throw new ApiError(errorMessage, response.status, errorData);
        }
        
        // Handle empty response body for 204 No Content
        if (response.status === 204 || response.headers.get('Content-Length') === '0') {
            return null as T;
        }

        const data = await response.json();
        return data; 
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Handle network errors (fetch throws TypeError on network failure)
        throw new ApiError('حدث خطأ في الاتصال بالشبكة. يرجى التحقق من الإنترنت.', 0);
    }
};

export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => makeRequest(endpoint, { method: 'GET' }),
  post: async <T>(endpoint: string, body: any): Promise<T> => makeRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: async <T>(endpoint: string, body: any): Promise<T> => makeRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: async <T>(endpoint: string): Promise<T> => makeRequest(endpoint, { method: 'DELETE' }),
};
