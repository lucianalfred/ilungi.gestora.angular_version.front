import { Injectable, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { User, UserRole } from '../models/types';
import { mapUserFromAPI } from '../utils/mapper';
import { environment
  
 } from '../enviroments/environment.prod';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<User | null>(null);
  private isLoadingSignal = signal(false);
  private hasLoggedRef = false;

  // Signals públicos
  public user = this.userSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();

  // Computed signals
  public isAuthenticated = computed(() => this.userSignal() !== null);
  public isAdmin = computed(() => this.userSignal()?.role === UserRole.ADMIN);

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    // Tentar carregar usuário do token salvo
    this.loadStoredUser();

    // Efeito para log de desenvolvimento
    effect(() => {
      if (!this.hasLoggedRef && !environment.production) {
        console.log('🔍 AuthService - estado:', {
          user: this.userSignal(),
          isAuthenticated: this.isAuthenticated()
        });
        this.hasLoggedRef = true;
      }
    });
  }

  private async loadStoredUser() {
    const token = this.apiService.getToken();
    if (!token) {
      this.userSignal.set(null);
      return;
    }

    this.isLoadingSignal.set(true);
    try {
      const response = await this.apiService.getCurrentUser().toPromise();
      if (response) {
        const user = mapUserFromAPI(response);
        this.userSignal.set(user);
      } else {
        this.apiService.removeToken();
        this.userSignal.set(null);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      this.apiService.removeToken();
      this.userSignal.set(null);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    this.isLoadingSignal.set(true);
    try {
      const response = await this.apiService.login(email, password).toPromise();
      
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
      console.error('Erro no login:', error);
      this.apiService.removeToken();
      this.userSignal.set(null);
      throw error;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async logout(): Promise<void> {
    this.isLoadingSignal.set(true);
    try {
      await this.apiService.logout().toPromise();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      this.apiService.removeToken();
      this.userSignal.set(null);
      this.isLoadingSignal.set(false);
      this.router.navigate(['/login']);
    }
  }

  async register(email: string, name: string, password: string): Promise<void> {
    this.isLoadingSignal.set(true);
    try {
      await this.apiService.register(email, name, password).toPromise();
      
      // Auto login após 2 segundos
      setTimeout(async () => {
        try {
          await this.login(email, password);
        } catch (loginError) {
          console.error('Auto-login after registration failed:', loginError);
        }
      }, 2000);
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async validateSetupToken(token: string): Promise<any> {
    try {
      return await this.apiService.validateSetupToken(token).toPromise();
    } catch (error) {
      console.error('Erro ao validar token:', error);
      throw error;
    }
  }

  async setupPassword(token: string, password: string, confirmPassword: string): Promise<any> {
    try {
      return await this.apiService.setupPassword(token, password, confirmPassword).toPromise();
    } catch (error) {
      console.error('Erro ao definir senha:', error);
      throw error;
    }
  }

  async validateResetToken(token: string): Promise<any> {
    try {
      return await this.apiService.validateResetToken(token).toPromise();
    } catch (error) {
      console.error('Erro ao validar token:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<any> {
    try {
      return await this.apiService.resetPassword(token, newPassword, confirmPassword).toPromise();
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
  }

  setUser(user: User | null) {
    this.userSignal.set(user);
  }
}