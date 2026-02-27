import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { ForgotPasswordModalComponent } from '../forgot-password-modal/forgot-password-modal.component';
import { RegisterModalComponent } from '../register-modal/register-modal.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IconComponent,
    ButtonComponent,
    ForgotPasswordModalComponent,
    RegisterModalComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = signal('');
  password = signal('');
  rememberMe = signal(false);
  errorMessage = signal<string | null>(null);
  showForgotPassword = signal(false);
  showRegister = signal(false);

  constructor(public authService: AuthService) {}

  ngOnInit() {
    const savedEmail = localStorage.getItem('gestora_remember_email');
    if (savedEmail) {
      this.email.set(savedEmail);
      this.rememberMe.set(true);
    }
  }

  validateForm(): boolean {
    if (!this.email().trim()) {
      this.errorMessage.set('Por favor, preencha o campo de email.');
      return false;
    }
    if (!this.password().trim()) {
      this.errorMessage.set('Por favor, preencha o campo de senha.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email())) {
      this.errorMessage.set('Por favor, insira um email válido.');
      return false;
    }
    return true;
  }

  async onSubmit() {
    this.errorMessage.set(null);
    
    if (!this.validateForm()) return;
    
    try {
      await this.authService.login(this.email(), this.password(), this.rememberMe());
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Erro ao fazer login.');
    }
  }

  onRememberMeChange() {
    this.rememberMe.update(value => !value);
    if (this.rememberMe()) {
      localStorage.setItem('gestora_remember_email', this.email());
    } else {
      localStorage.removeItem('gestora_remember_email');
    }
  }
}