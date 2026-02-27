import { Component, Input, Output, EventEmitter, signal, computed, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  styleUrls: ['./users-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  // Signals reativos
  searchQuery = signal('');
  roleFilter = signal<string>('all');
  isAddUserOpen = signal(false);
  editingUserId = signal<string | null>(null);
  isUpdatePending = signal(false);
  isDeletePending = signal(false);

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get t() {
    return this.languageService.translations();
  }

  // Usuários filtrados (como useMemo no React)
  filteredUsers = computed(() => {
    const search = this.searchQuery().toLowerCase();
    const role = this.roleFilter();
    
    return this.users.filter(user => {
      const matchesSearch = search === '' || 
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        (user.position && user.position.toLowerCase().includes(search));
      
      const matchesRole = role === 'all' || user.role === role;
      
      return matchesSearch && matchesRole;
    });
  });

  // Usuários ordenados (admins primeiro, depois por nome)
  sortedUsers = computed(() => {
    return [...this.filteredUsers()].sort((a, b) => {
      if (a.role === UserRole.ADMIN && b.role !== UserRole.ADMIN) return -1;
      if (a.role !== UserRole.ADMIN && b.role === UserRole.ADMIN) return 1;
      return a.name.localeCompare(b.name);
    });
  });


  stats = computed(() => ({
    total: this.users.length,
    admins: this.users.filter(u => u.role === UserRole.ADMIN).length,
    employees: this.users.filter(u => u.role === UserRole.USER).length
  }));

  get showUserForm(): boolean {
    return this.isAddUserOpen() || !!this.editingUserId();
  }


  trackByUserId(index: number, user: User): string {
    return user.id;
  }


  reloadPage(): void {
    window.location.reload();
  }

  // Handlers
  handleEditUser(userId: string): void {
    this.editingUserId.set(userId);
  }

  handleCloseEdit(): void {
    this.editingUserId.set(null);
  }

  handleCloseAdd(): void {
    this.isAddUserOpen.set(false);
  }

  async handleUpdateUser(userId: string, userData: any): Promise<void> {
    this.isUpdatePending.set(true);
    this.updateUser.emit({ id: userId, data: userData });
    this.handleCloseEdit();
    setTimeout(() => {
      this.isUpdatePending.set(false);
      this.cdr.markForCheck();
    }, 500);
  }

  async handleDeleteUser(userId: string): Promise<void> {
    this.isDeletePending.set(true);
    this.deleteUser.emit(userId);
    setTimeout(() => {
      this.isDeletePending.set(false);
      this.cdr.markForCheck();
    }, 500);
  }

  async handleCreateUser(userData: any): Promise<void> {
    this.isUpdatePending.set(true);
    this.createUser.emit(userData);
    this.handleCloseAdd();
    setTimeout(() => {
      this.isUpdatePending.set(false);
      this.cdr.markForCheck();
    }, 500);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onRoleFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.roleFilter.set(value);
  }
}