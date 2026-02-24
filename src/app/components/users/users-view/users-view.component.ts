import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { UserCardComponent } from '../user-card/user-card.component';
import { UserModalComponent } from '../user-modal/user-modal.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { LoadingOverlayComponent } from '../../shared/loading-overlay/loading-overlay.component';
import { User, UserRole } from '../../../models/types';
import { LanguageService } from '../../../services/language.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-users-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    ButtonComponent,
    UserCardComponent,
    UserModalComponent,
    LoadingSpinnerComponent,
    LoadingOverlayComponent
  ],
  templateUrl: './users-view.component.html',
  styleUrls: ['./users-view.component.css']
})
export class UsersViewComponent implements OnInit {
  @Input() users: User[] = [];
  @Input() currentUser!: User;  // Pode ser null? Se sim, mude para: @Input() currentUser: User | null = null;
  @Input() isLoading = false;
  @Input() isFetching = false;
  @Input() error: Error | null = null;

  @Output() updateUser = new EventEmitter<{ id: string; data: any }>();
  @Output() deleteUser = new EventEmitter<string>();
  @Output() createUser = new EventEmitter<any>();
  @Output() avatarUpload = new EventEmitter<string>();

  readonly UserRole = UserRole;

  searchQuery = signal('');
  roleFilter = signal<string>('all');
  isAddUserOpen = signal(false);
  editingUserId = signal<string | null>(null);
  isUpdatePending = signal(false);
  isDeletePending = signal(false);

  private searchSubject = new Subject<string>();

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(query => {
      this.searchQuery.set(query);
    });
  }

  get t() {
    return this.languageService.translations();
  }

  get filteredUsers(): User[] {
    return this.users.filter(user => {
      const matchesSearch = this.searchQuery() === '' || 
        user.name.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
        (user.position && user.position.toLowerCase().includes(this.searchQuery().toLowerCase()));
      
      const matchesRole = this.roleFilter() === 'all' || user.role === this.roleFilter();
      
      return matchesSearch && matchesRole;
    });
  }

  get sortedUsers(): User[] {
    return [...this.filteredUsers].sort((a, b) => {
      if (a.role === UserRole.ADMIN && b.role !== UserRole.ADMIN) return -1;
      if (a.role !== UserRole.ADMIN && b.role === UserRole.ADMIN) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  get stats() {
    return {
      total: this.users.length,
      admins: this.users.filter(u => u.role === UserRole.ADMIN).length,
      employees: this.users.filter(u => u.role === UserRole.USER).length
    };
  }

  reloadPage() {
    window.location.reload();
  }

  handleEditUser(userId: string) {
    this.editingUserId.set(userId);
  }

  handleCloseEdit() {
    this.editingUserId.set(null);
  }

  handleCloseAdd() {
    this.isAddUserOpen.set(false);
  }

  async handleUpdateUser(userId: string, userData: any) {
    this.isUpdatePending.set(true);
    this.updateUser.emit({ id: userId, data: userData });
    this.handleCloseEdit();
    setTimeout(() => this.isUpdatePending.set(false), 500);
  }

  async handleDeleteUser(userId: string) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      this.isDeletePending.set(true);
      this.deleteUser.emit(userId);
      setTimeout(() => this.isDeletePending.set(false), 500);
    }
  }

  async handleCreateUser(userData: any) {
    this.isUpdatePending.set(true);
    this.createUser.emit(userData);
    this.handleCloseAdd();
    setTimeout(() => this.isUpdatePending.set(false), 500);
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onRoleFilterChange(event: Event) {
    this.roleFilter.set((event.target as HTMLSelectElement).value);
  }
}