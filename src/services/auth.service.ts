// apps/client/services/auth.service.ts
import { api } from '@/lib/axios';
import { AuthResponse, LoginDto, RegisterDto } from '@/services/dto/auth.dto';


export class AuthService {
  static async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    this.setToken(response.data.access_token);
    return response.data;
  }

  static async signup(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post('/auth/signup', data);
    this.setToken(response.data.access_token);
    return response.data;
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('token');
    api.defaults.headers.common['Authorization'] = '';
  }

  static async getProfile(): Promise<any> {
    const response = await api.get('/auth/profile');
    return response.data;
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}