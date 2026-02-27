import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { User, UserRole } from '../../../models/types';

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
  @Input() getAvatarUrl!: (user: User) => string | null;

  @Output() onEdit = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();
  @Output() onAvatarUpload = new EventEmitter<string>();

  isLocalDeleting = signal(false);

  get UserRole() {
    return UserRole;
  }

  get isCurrentUser(): boolean {
    return this.currentUser?.id === this.user?.id;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
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

  handleEdit(): void {
    this.onEdit.emit(this.user.id);
  }

  handleDelete(): void {
    if (!confirm(`Tem certeza que deseja excluir ${this.user.name}?`)) {
      return;
    }
    
    this.isLocalDeleting.set(true);
    this.onDelete.emit(this.user.id);
    setTimeout(() => this.isLocalDeleting.set(false), 1000);
  }

  handleAvatarUpload(): void {
    if (this.isAdmin && !this.isLoading) {
      this.onAvatarUpload.emit(this.user.id);
    }
  }
}