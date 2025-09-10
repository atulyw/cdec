// API utility functions for making HTTP requests

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('token');

    console.log(`[API] Making ${options.method || 'GET'} request to: ${url}`);
    console.log(`[API] Base URL: ${this.baseUrl}`);
    console.log(`[API] Token present: ${!!token}`);

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      console.log(`[API] Response status: ${response.status} ${response.statusText}`);
      
      let data;
      try {
        data = await response.json();
        console.log(`[API] Response data:`, data);
      } catch (parseError) {
        console.error(`[API] Failed to parse JSON response:`, parseError);
        return {
          success: false,
          error: `Invalid JSON response from server (${response.status})`,
        };
      }

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error(`[API] Request failed:`, errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      console.log(`[API] Request successful`);
      return {
        success: true,
        data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      console.error(`[API] Network error:`, error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API clients for each service
export const authApi = new ApiClient(import.meta.env.VITE_AUTH_API);
export const courseApi = new ApiClient(import.meta.env.VITE_COURSE_API);
export const enrollApi = new ApiClient(import.meta.env.VITE_ENROLL_API);
