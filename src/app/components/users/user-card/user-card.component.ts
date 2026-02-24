import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { User, UserRole } from '../../../models/types';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent {
  @Input() user!: User;
  @Input() currentUser!: User;
  @Input() isDeleting = false;

  @Output() onEdit = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();
  @Output() onAvatarUpload = new EventEmitter<string>();

  // icon variables removed; use <app-icon name="..."> in templates

  isLocalDeleting = signal(false);

  constructor(private languageService: LanguageService) {}

  get t() {
    return this.languageService.translations();
  }

  get isCurrentUser(): boolean {
    return this.currentUser.id === this.user.id;
  }

  get isAdmin(): boolean {
    return this.currentUser.role === UserRole.ADMIN;
  }

  get canEdit(): boolean {
    return this.isAdmin && !this.isCurrentUser;
  }

  get canDelete(): boolean {
    return this.isAdmin && !this.isCurrentUser;
  }

  get isLoading(): boolean {
    return this.isLocalDeleting() || this.isDeleting;
  }

  get createdAt(): string | null {
    return this.user.createdAt 
      ? new Date(this.user.createdAt).toLocaleDateString('pt-PT', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        })
      : null;
  }

  get UserRole() {
    return UserRole;
  }

  handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir ${this.user.name}?`)) {
      return;
    }
    
    this.isLocalDeleting.set(true);
    this.onDelete.emit(this.user.id);
    setTimeout(() => this.isLocalDeleting.set(false), 1000);
  }

  handleEdit() {
    this.onEdit.emit(this.user.id);
  }

  handleAvatarUpload() {
    if (this.isAdmin && !this.isLoading) {
      this.onAvatarUpload.emit(this.user.id);
    }
  }
}