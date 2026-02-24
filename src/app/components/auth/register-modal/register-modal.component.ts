import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ButtonComponent],
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.css']
})

export class RegisterModalComponent {
  @Output() close = new EventEmitter<void>();

  formData = signal({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  isLoading = signal(false);
  registerSuccess = signal(false);
  registerError = signal<string | null>(null);

  validateForm(): boolean {
    if (!this.formData().name.trim()) {
      this.registerError.set('Por favor, preencha o nome.');
      return false;
    }
    if (!this.formData().email.trim()) {
      this.registerError.set('Por favor, preencha o email.');
      return false;
    }
    if (!this.formData().password || this.formData().password.length < 6) {
      this.registerError.set('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    if (this.formData().password !== this.formData().confirmPassword) {
      this.registerError.set('As senhas não coincidem.');
      return false;
    }
    return true;
  }

  handleInputChange(field: string, value: string) {
    this.formData.update(data => ({ ...data, [field]: value }));
    if (this.registerError()) {
      this.registerError.set(null);
    }
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    this.registerError.set(null);
    
    if (!this.validateForm()) return;
    
    this.isLoading.set(true);
    
    try {
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.registerSuccess.set(true);
      
      setTimeout(() => {
        this.closeModal();
      }, 2000);
    } catch (error: any) {
      this.registerError.set(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  closeModal() {
    this.formData.set({ name: '', email: '', password: '', confirmPassword: '' });
    this.registerError.set(null);
    this.close.emit();
  }
}