import { Component, Input, Output, EventEmitter, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { UserCardComponent } from '../user-card/user-card.component';
import { UserModalComponent } from '../user-modal/user-modal.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { LoadingOverlayComponent } from '../../shared/loading-overlay/loading-overlay.component';
import { User, UserRole } from '../../../models/types';
import { LanguageService } from '../../../services/language.service';

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
export class UsersViewComponent implements OnInit, OnDestroy {
  @Input() users: User[] = [];
  @Input() currentUser!: User;
  @Input() isLoading = false;
  @Input() isFetching = false;
  @Input() error: Error | null = null;
  @Input() getAvatarUrl!: (user: User) => string | null;

  @Output() updateUser = new EventEmitter<{ id: string; data: any }>();
  @Output() deleteUser = new EventEmitter<string>();
  @Output() createUser = new EventEmitter<any>();
  @Output() avatarUpload = new EventEmitter<string>();

  readonly UserRole = UserRole;

  // ✅ SIGNALS REATIVOS
  searchQuery = signal('');
  roleFilter = signal<string>('all');
  isAddUserOpen = signal(false);
  editingUserId = signal<string | null>(null);
  isUpdatePending = signal(false);
  isDeletePending = signal(false);

  // ✅ COMPUTED SIGNALS - COM LOGS DE DEBUG
  filteredUsers = computed(() => {
    console.log('🚀 === COMPUTED FILTER EXECUTADO === Total users:', this.users?.length || 0);
    console.log('📊 Usuários recebidos:', this.users);
    
    if (!this.users || this.users.length === 0) {
      console.log('⚠️ Nenhum usuário recebido');
      return [];
    }
    
    const query = this.searchQuery().toLowerCase();
    const roleFilterValue = this.roleFilter();
    
    const filtered = this.users.filter(user => {
      const matchesSearch = query === '' || 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.position && user.position.toLowerCase().includes(query));
      
      const matchesRole = roleFilterValue === 'all' || user.role === roleFilterValue;
      
      return matchesSearch && matchesRole;
    });
    
    console.log('✅ Usuários filtrados:', filtered.length);
    return filtered;
  });

  sortedUsers = computed(() => {
    const filtered = this.filteredUsers();
    console.log('📊 Ordenando usuários. Quantidade filtrada:', filtered.length);
    
    const sorted = [...filtered].sort((a, b) => {
      if (a.role === UserRole.ADMIN && b.role !== UserRole.ADMIN) return -1;
      if (a.role !== UserRole.ADMIN && b.role === UserRole.ADMIN) return 1;
      return a.name.localeCompare(b.name);
    });
    
    console.log('✅ Usuários ordenados:', sorted.length);
    return sorted;
  });

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(query => {
      this.searchQuery.set(query);
    });
    
    console.log('✅ UsersViewComponent inicializado');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get t() {
    return this.languageService.translations();
  }

  get stats() {
    return {
      total: this.users.length,
      admins: this.users.filter(u => u.role === UserRole.ADMIN).length,
      employees: this.users.filter(u => u.role === UserRole.USER).length
    };
  }

  get showUserForm(): boolean {
    return this.isAddUserOpen() || !!this.editingUserId();
  }

  // ✅ TRACKBY OBRIGATÓRIO
  trackByUserId(index: number, user: User): string {
    return user.id;
  }

  reloadPage() {
    window.location.reload();
  }

  handleEditUser(userId: string) {
    console.log('✏️ Editando usuário:', userId);
    this.editingUserId.set(userId);
  }

  handleCloseEdit() {
    console.log('🔒 Fechando edição');
    this.editingUserId.set(null);
  }

  handleCloseAdd() {
    console.log('🔒 Fechando adição');
    this.isAddUserOpen.set(false);
  }

  async handleUpdateUser(userId: string, userData: any) {
    console.log('🔄 Atualizando usuário:', userId, userData);
    this.isUpdatePending.set(true);
    this.updateUser.emit({ id: userId, data: userData });
    this.handleCloseEdit();
    setTimeout(() => this.isUpdatePending.set(false), 500);
  }

  async handleDeleteUser(userId: string) {
    console.log('🗑️ Deletando usuário:', userId);
    this.isDeletePending.set(true);
    this.deleteUser.emit(userId);
    setTimeout(() => this.isDeletePending.set(false), 500);
  }

  async handleCreateUser(userData: any) {
    console.log('➕ Criando usuário:', userData);
    this.isUpdatePending.set(true);
    this.createUser.emit(userData);
    this.handleCloseAdd();
    setTimeout(() => this.isUpdatePending.set(false), 500);
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    console.log('🔍 Pesquisando:', value);
    this.searchSubject.next(value);
  }

  onRoleFilterChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    console.log('🎯 Filtro de role:', value);
    this.roleFilter.set(value);
  }
}
