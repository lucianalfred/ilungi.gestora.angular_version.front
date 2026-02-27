import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Lock, AlertTriangle, CheckCircle2, Check, ArrowLeft } from 'lucide-angular';
import { ButtonComponent } from '../shared/index';
import { AuthService } from '../../services/auth.service';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideAngularModule,
    ButtonComponent
  ],
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.css']
})
export class SetPasswordComponent implements OnInit {
  readonly Lock = Lock;
  readonly AlertTriangle = AlertTriangle;
  readonly CheckCircle2 = CheckCircle2;
  readonly Check = Check;
  readonly ArrowLeft = ArrowLeft;

  // State
  token = signal<string | null>(null);
  isTokenValid = signal<boolean | null>(null);
  userInfo = signal<{ name: string; email: string } | null>(null);
  isLoading = signal(false);
  isValidating = signal(true);
  
  newPassword = signal('');
  confirmPassword = signal('');
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    
    if (tokenParam) {
      this.token.set(tokenParam);
      this.validateToken(tokenParam);
    } else {
      this.isTokenValid.set(false);
      this.errorMessage.set('Link inválido ou incompleto.');
      this.isValidating.set(false);
    }
  }

  async validateToken(tokenToValidate: string) {
    try {
      this.isValidating.set(true);
      const data = await this.authService.validateSetupToken(tokenToValidate);
      
      if (data.valid) {
        this.isTokenValid.set(true);
        this.userInfo.set({
          name: data.user?.name || '',
          email: data.user?.email || ''
        });
      } else {
        this.isTokenValid.set(false);
        this.errorMessage.set(data.error || 'Token inválido ou expirado.');
      }
    } catch (error: any) {
      this.isTokenValid.set(false);
      this.errorMessage.set(error.message || 'Erro ao validar token. Tente novamente.');
    } finally {
      this.isValidating.set(false);
    }
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.newPassword().trim()) {
      this.errorMessage.set('Por favor, preencha a senha.');
      return;
    }

    if (this.newPassword().trim().length < 6) {
      this.errorMessage.set('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.errorMessage.set('As senhas não coincidem.');
      return;
    }

    if (!this.token()) {
      this.errorMessage.set('Token inválido. Solicite um novo link.');
      return;
    }

    this.isLoading.set(true);

    try {
      const data = await this.authService.setupPassword(
        this.token()!,
        this.newPassword(),
        this.confirmPassword()
      );
      
      this.successMessage.set(data.message || 'Senha definida com sucesso!');
      
      // Clean URL
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        this.navigationService.goToLogin();
      }, 3000);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Erro ao definir senha.');
    } finally {
      this.isLoading.set(false);
    }
  }

  get passwordLengthValid(): boolean {
    return this.newPassword().length >= 6;
  }

  get passwordsMatch(): boolean {
    return this.newPassword() === this.confirmPassword() && this.newPassword().length > 0;
  }

  goToLogin() {
    this.navigationService.goToLogin();
  }
}