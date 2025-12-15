
import { getToken, clearToken } from './tokenManager';

// Use relative path for Vercel deployment. 
// This allows the app to communicate with Vercel Serverless Functions (e.g. /api/sendEmail)
// or a proxy configured in vercel.json.
const API_BASE_URL = '/api';

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

    let response: Response;

    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    } catch (error) {
        // Handle network errors (fetch throws TypeError on network failure)
        throw new ApiError('حدث خطأ في الاتصال بالشبكة. يرجى التحقق من الإنترنت.', 0);
    }

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

        let errorMessage = `فشل الطلب: ${response.status} ${response.statusText}`;
        let errorData = null;

        try {
            // Try to parse JSON error, fallback to text if parsing fails (e.g., HTML 500 error)
            const textBody = await response.text();
            try {
                const jsonBody = JSON.parse(textBody);
                errorMessage = jsonBody.message || errorMessage;
                errorData = jsonBody;
            } catch {
                // If it's not JSON, stick to the status text or a slice of the body if it's short
                if (textBody.length < 100) errorMessage = textBody;
            }
        } catch (e) {
            // Failed to read body
        }

        throw new ApiError(errorMessage, response.status, errorData);
    }
    
    // Handle empty response body for 204 No Content
    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        return null as T;
    }

    try {
        const data = await response.json();
        return data; 
    } catch (error) {
        throw new ApiError('فشل تحليل استجابة الخادم.', response.status);
    }
};

export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => makeRequest(endpoint, { method: 'GET' }),
  post: async <T>(endpoint: string, body: any): Promise<T> => makeRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: async <T>(endpoint: string, body: any): Promise<T> => makeRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: async <T>(endpoint: string): Promise<T> => makeRequest(endpoint, { method: 'DELETE' }),
};
