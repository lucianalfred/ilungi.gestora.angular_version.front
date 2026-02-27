import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { User, UserRole } from '../models/types';
import { mapUserFromAPI } from '../utils/mapper';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<User | null>(null);
  private isLoadingSignal = signal(false);

  public user = this.userSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();

  public isAuthenticated = computed(() => this.userSignal() !== null);
  public isAdmin = computed(() => this.userSignal()?.role === UserRole.ADMIN);

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  /**
   * Carrega usuário do token armazenado
   */
  private async loadStoredUser(): Promise<void> {
    const token = this.apiService.getToken();
    
    if (!token) {
      this.userSignal.set(null);
      return;
    }

    this.isLoadingSignal.set(true);
    try {
      const response = await firstValueFrom(this.apiService.getCurrentUser());
      
      if (response) {
        const user = mapUserFromAPI(response);
        this.userSignal.set(user);
      } else {
        this.apiService.removeToken();
        this.userSignal.set(null);
      }
    } catch (error) {
      this.apiService.removeToken();
      this.userSignal.set(null);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Realiza login do usuário
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    this.isLoadingSignal.set(true);
    try {
      const response = await firstValueFrom(this.apiService.login(email, password));
      
      const token = response?.token || response?.jwt;
      if (!token) {
        throw new Error('Token não recebido');
      }

      this.apiService.setToken(token, rememberMe);

      if (rememberMe) {
        localStorage.setItem('gestora_remember_email', email);
      }

      const userData = response?.user || response;
      const user = mapUserFromAPI(userData);
      this.userSignal.set(user);

      if (user.mustChangePassword) {
        this.router.navigate(['/app'], { queryParams: { tab: 'profile' } });
      } else {
        this.router.navigate(['/app']);
      }
    } catch (error) {
      this.apiService.removeToken();
      this.userSignal.set(null);
      throw error;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Realiza logout do usuário
   */
  async logout(): Promise<void> {
    this.isLoadingSignal.set(true);
    try {
      await firstValueFrom(this.apiService.logout());
    } catch (error) {
  
    } finally {
      this.apiService.removeToken();
      this.userSignal.set(null);
      this.isLoadingSignal.set(false);
      localStorage.removeItem('gestora_remember_email');
      this.router.navigate(['/login']);
    }
  }

  /**
   * Registra um novo usuário
   */
  async register(email: string, name: string, password: string): Promise<void> {
    this.isLoadingSignal.set(true);
    try {
      await firstValueFrom(this.apiService.register(email, name, password));
      
      setTimeout(async () => {
        try {
          await this.login(email, password);
        } catch (loginError) {
      
        }
      }, 2000);
    } catch (error) {
      throw error;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Valida token de configuração de senha
   */
  async validateSetupToken(token: string): Promise<any> {
    try {
      return await firstValueFrom(this.apiService.validateSetupToken(token));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Configura senha com token
   */
  async setupPassword(token: string, password: string, confirmPassword: string): Promise<any> {
    try {
      return await firstValueFrom(this.apiService.setupPassword(token, password, confirmPassword));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Valida token de reset de senha
   */
  async validateResetToken(token: string): Promise<any> {
    try {
      return await firstValueFrom(this.apiService.validateResetToken(token));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reseta senha com token
   */
  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<any> {
    try {
      return await firstValueFrom(this.apiService.resetPassword(token, newPassword, confirmPassword));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Define o usuário atual
   */
  setUser(user: User | null): void {
    this.userSignal.set(user);
    if (user) {
      localStorage.setItem('gestora_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gestora_user');
    }
  }

  /**
   * Recarrega os dados do usuário atual
   */
  async refreshUser(): Promise<void> {
    await this.loadStoredUser();
  }
}