import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { User, UserRole } from '../../../models/types';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    ButtonComponent,
    LoadingSpinnerComponent
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

  // Form fields como signals
  name = signal('');
  email = signal('');
  phone = signal('');
  position = signal('');
  department = signal('');
  role = signal<UserRole>(UserRole.USER);

  error = signal<string | null>(null);

  constructor(
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {
   
  }

  ngOnInit() {
    
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges) {
  
   
    if (changes['editingUserId'] && this.editingUserId) {
     
      setTimeout(() => {
        this.loadUserData();
      }, 100); 
    }
    
    if (changes['isOpen'] && !this.isOpen) {
      console.log('🧹 Modal fechado, resetando formulário');
      this.resetForm();
    }
  }

  
  get nameValue(): string {
    return this.name();
  }
  set nameValue(value: string) {
    this.name.set(value);
  }

  get emailValue(): string {
    return this.email();
  }
  set emailValue(value: string) {
    this.email.set(value);
  }

  get phoneValue(): string {
    return this.phone();
  }
  set phoneValue(value: string) {
    this.phone.set(value);
  }

  get positionValue(): string {
    return this.position();
  }
  set positionValue(value: string) {
    this.position.set(value);
  }

  get departmentValue(): string {
    return this.department();
  }
  set departmentValue(value: string) {
    this.department.set(value);
  }

  get roleValue(): UserRole {
    return this.role();
  }
  set roleValue(value: UserRole) {
    this.role.set(value);
  }
  get t() {
    return this.languageService.translations();
  }
  get editingUser(): User | undefined {
    if (!this.editingUserId) {
      return undefined;
    }
    const found = this.users.find(u => u.id === this.editingUserId);
    return found;
  }
  get UserRole() {
    return UserRole;
  }
  get isEditing(): boolean {
    return !!this.editingUserId;
  }
  get isSelf(): boolean {
    return this.editingUserId === this.currentUser?.id;
  }
  loadUserData() {
  
    
    if (this.editingUser) {
     
      
      // ATUALIZAR TODOS OS SIGNALS
      this.name.set(this.editingUser.name || '');
      this.email.set(this.editingUser.email || '');
      this.phone.set(this.editingUser.phone || '');
      this.position.set(this.editingUser.position || '');
      this.department.set(this.editingUser.department || '');
      this.role.set(this.editingUser.role || UserRole.USER);
      this.error.set(null);
      this.cdr.detectChanges();
    } else {
      
     
    }
  }

  resetForm() {
    console.log('🧹 resetForm() chamado');
    
    this.name.set('');
    this.email.set('');
    this.phone.set('');
    this.position.set('');
    this.department.set('');
    this.role.set(UserRole.USER);
    this.error.set(null);
    

  }

  validateForm(): boolean {
    if (!this.name().trim()) {
      this.error.set('Por favor, preencha o nome.');
      return false;
    }

    if (!this.email().trim()) {
      this.error.set('Por favor, preencha o email.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email())) {
      this.error.set('Por favor, insira um email válido.');
      return false;
    }

    if (!this.isEditing) {
      const emailExists = this.users.some(u => 
        u.email.toLowerCase() === this.email().toLowerCase()
      );
      if (emailExists) {
        this.error.set('Este email já está cadastrado no sistema.');
        return false;
      }
    } else {
      const emailExists = this.users.some(u => 
        u.id !== this.editingUserId && 
        u.email.toLowerCase() === this.email().toLowerCase()
      );
      if (emailExists) {
        this.error.set('Este email já está cadastrado em outro utilizador.');
        return false;
      }
    }

    if (this.phone()) {
      const phoneRegex = /^[0-9+\-\s()]{9,}$/;
      if (!phoneRegex.test(this.phone())) {
        this.error.set('Por favor, insira um número de telefone válido.');
        return false;
      }
    }

    return true;
  }

  handleSubmit() {
    if (!this.validateForm()) return;

    const userData = {
      name: this.name(),
      email: this.email(),
      phone: this.phone() || undefined,
      position: this.position() || undefined,
      department: this.department() || undefined,
      role: this.role()
    };

 
    this.onSuccess.emit(userData);
  }

  handleClose() {

    this.resetForm();
    this.onClose.emit();
  }
}