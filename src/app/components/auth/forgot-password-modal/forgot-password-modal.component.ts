import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-forgot-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ButtonComponent],
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.css']
})
export class ForgotPasswordModalComponent {
  @Output() close = new EventEmitter<void>();

  email = signal('');
  message = signal<string | null>(null);
  isLoading = signal(false);

  constructor(private apiService: ApiService) {}

  validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async onSubmit() {
    if (!this.email()) {
      this.message.set('Por favor, insira o seu email.');
      return;
    }

    if (!this.validateEmail(this.email())) {
      this.message.set('Por favor, insira um email válido.');
      return;
    }

    this.message.set('Processando...');
    this.isLoading.set(true);

    try {
      const response = await this.apiService.forgotPassword(this.email()).toPromise();
      
      if (response && response.message) {
        this.message.set(`✅ ${response.message}`);
      } else {
        this.message.set(
          `✅ Solicitação enviada com sucesso! Se o email ${this.email()} estiver cadastrado, você receberá instruções em instantes.`
        );
      }
      
      setTimeout(() => {
        this.closeModal();
      }, 5000);
      
    } catch (error: any) {
      console.error('❌ Erro no forgot password:', error);
      
      if (error.message?.includes('404')) {
        this.message.set('❌ Endpoint de recuperação não encontrado. Contacte o administrador.');
      } else if (error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
        this.message.set('❌ Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        this.message.set(`❌ ${error.message || 'Erro ao solicitar recuperação de senha.'}`);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  closeModal() {
    this.close.emit();
  }
}