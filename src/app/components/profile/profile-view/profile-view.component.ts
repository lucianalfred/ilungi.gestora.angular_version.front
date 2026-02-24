import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { User, UserRole } from '../../../models/types';
import { LanguageService } from '../../../services/language.service';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IconComponent,
    ButtonComponent
  ],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css']
})
export class ProfileViewComponent implements OnInit {
  @Input() user!: User;
  @Input() profilePassword = '';
  @Input() profilePasswordConfirm = '';
  @Input() profilePasswordError: string | null = null;
  @Input() profilePasswordSuccess: string | null = null;

  @Output() setProfilePassword = new EventEmitter<string>();
  @Output() setProfilePasswordConfirm = new EventEmitter<string>();
  @Output() setProfilePasswordError = new EventEmitter<string | null>();
  @Output() setProfilePasswordSuccess = new EventEmitter<string | null>();
  @Output() setActiveTabSafe = new EventEmitter<string>();
  @Output() onAvatarUpload = new EventEmitter<string>();
  @Output() updateUser = new EventEmitter<{ id: string; data: any }>();
  @Output() addNotification = new EventEmitter<{ userId: string; message: string; type?: 'info' | 'success' | 'error' }>();

  // Signals locais
  isEditing = signal(false);
  editedUser = signal<Partial<User>>({});
  isUpdating = signal(false);
  isChangingPassword = signal(false);

  constructor(
    private languageService: LanguageService,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    // Não chamar startEditing aqui - só quando o usuário clicar em editar
  }

  // Getters
  get t() {
    return this.languageService.translations();
  }

  get UserRole() {
    return UserRole;
  }

  getAvatarUrl(user: User): string | null {
    return user.avatar || null;
  }

  // Métodos
  startEditing() {
    this.editedUser.set({
      name: this.user.name,
      email: this.user.email,
      position: this.user.position,
      department: this.user.department,
      role: this.user.role
    });
    this.isEditing.set(true);
  }

  cancelEditing() {
    this.isEditing.set(false);
  }

  async handleProfileUpdate(event: Event) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    
    const updates: Partial<User> = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    };

    // Apenas admin pode atualizar estes campos
    if (this.user.role === UserRole.ADMIN) {
      updates.position = formData.get('position') as string;
      updates.department = formData.get('department') as string;
      updates.role = (formData.get('role') as UserRole) || this.user.role;
    }

    try {
      // Validar se não-admin está tentando alterar email
      if (this.user.role !== UserRole.ADMIN && updates.email !== this.user.email) {
        this.addNotification.emit({
          userId: this.user.id,
          message: 'O email só pode ser alterado por um administrador.',
          type: 'error'
        });
        return;
      }

      this.isUpdating.set(true);
      
      // Usar updateUser
      this.updateUser.emit({ id: this.user.id, data: updates });
      
      this.addNotification.emit({
        userId: this.user.id,
        message: 'Perfil atualizado com sucesso.',
        type: 'success'
      });
      this.isEditing.set(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      this.addNotification.emit({
        userId: this.user.id,
        message: 'Não foi possível atualizar o perfil.',
        type: 'error'
      });
    } finally {
      this.isUpdating.set(false);
    }
  }

  async handlePasswordChange(event: Event) {
    event.preventDefault();
    this.setProfilePasswordError.emit(null);
    this.setProfilePasswordSuccess.emit(null);

    if (!this.profilePassword.trim()) {
      this.setProfilePasswordError.emit('Preencha a nova senha.');
      return;
    }

    if (this.profilePassword.trim().length < 6) {
      this.setProfilePasswordError.emit('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (this.profilePassword !== this.profilePasswordConfirm) {
      this.setProfilePasswordError.emit('As senhas não coincidem.');
      return;
    }

    this.isChangingPassword.set(true);

    try {
      await this.usersService.changePassword(this.user.id, this.profilePassword);
      
      this.setProfilePassword.emit('');
      this.setProfilePasswordConfirm.emit('');
      this.setProfilePasswordSuccess.emit('Senha atualizada com sucesso.');
      
      if (this.user.mustChangePassword) {
        setTimeout(() => this.setActiveTabSafe.emit('dashboard'), 2000);
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      this.setProfilePasswordError.emit('Não foi possível atualizar a senha.');
    } finally {
      this.isChangingPassword.set(false);
    }
  }
  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  onAvatarClick() {
    this.onAvatarUpload.emit(this.user.id);
  }
}