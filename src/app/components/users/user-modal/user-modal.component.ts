import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { User, UserRole } from '../../../models/types';
import { LucideAngularModule } from 'lucide-angular'; 

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    ButtonComponent,
    InputComponent,
    LoadingSpinnerComponent,
     LucideAngularModule
  ],
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css']
})
export class UserModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() editingUserId: string | null = null;
  @Input() users: User[] = [];
  @Input() currentUser!: User;
  @Input() isSubmitting = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<any>();

  // Form fields
  name = signal('');
  email = signal('');
  phone = signal('');
  role = signal<UserRole>(UserRole.USER);

  errors: { [key: string]: string } = {};

  constructor() {}

  ngOnInit() {
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['editingUserId'] && this.editingUserId) {
      this.loadUserData();
    }
    if (changes['isOpen'] && this.isOpen && !this.editingUserId) {
      this.resetForm();
    }
  }

  get editingUser(): User | undefined {
    return this.editingUserId 
      ? this.users.find(u => u.id === this.editingUserId)
      : undefined;
  }

  get UserRole() {
    return UserRole;
  }

  loadUserData() {
    if (this.editingUser) {
      this.name.set(this.editingUser.name);
      this.email.set(this.editingUser.email);
      this.phone.set(this.editingUser.phone || '');
      this.role.set(this.editingUser.role);
    }
  }

  resetForm() {
    this.name.set('');
    this.email.set('');
    this.phone.set('');
    this.role.set(UserRole.USER);
    this.errors = {};
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.name().trim()) {
      this.errors['name'] = 'Nome é obrigatório';
      isValid = false;
    }

    if (!this.email().trim()) {
      this.errors['email'] = 'Email é obrigatório';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email())) {
        this.errors['email'] = 'Email inválido';
        isValid = false;
      }
    }

    return isValid;
  }

  handleSubmit() {
    if (!this.validateForm()) return;

    const userData = {
      name: this.name(),
      email: this.email(),
      phone: this.phone() || undefined,
      role: this.role()
    };

    this.onSuccess.emit(userData);
  }

  handleClose() {
    this.resetForm();
    this.onClose.emit();
  }
}