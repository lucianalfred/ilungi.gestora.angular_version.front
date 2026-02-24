import { Injectable, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { User, UserRole } from '../models/types';
import { mapUserFromAPI } from '../utils/mapper';
import { NotificationsService } from './notifications.service';
import { ActivitiesService } from './activities.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  // =====================================================
  // STATE (Signals privados)
  // =====================================================

  private _users = signal<User[]>([]);
  private _isLoading = signal(false);

  // =====================================================
  // READONLY SIGNALS públicos
  // =====================================================

  users = this._users.asReadonly();
  isLoading = this._isLoading.asReadonly();

  // =====================================================
  // COMPUTED
  // =====================================================

  admins = computed(() =>
    this._users().filter(u => u.role === UserRole.ADMIN)
  );

  employees = computed(() =>
    this._users().filter(u => u.role === UserRole.USER)
  );

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private apiService: ApiService,
    private notificationsService: NotificationsService,
    private activitiesService: ActivitiesService
  ) {}

  // =====================================================
  // LOAD USERS (apenas admins)
  // =====================================================

  async loadUsers(): Promise<void> {
    this._isLoading.set(true);

    try {
      const response = await firstValueFrom(
        this.apiService.getAdminUsers()
      );

      const users = Array.isArray(response)
        ? response.map(mapUserFromAPI)
        : [];

      this._users.set([...users]);

    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      this._users.set([]);
    } finally {
      this._isLoading.set(false);
    }
  }

  // =====================================================
  // LOAD ALL USERS
  // =====================================================

  async loadAllUsers(): Promise<void> {
    this._isLoading.set(true);

    try {
      const response = await firstValueFrom(
        this.apiService.getUsers()
      );

      const users = Array.isArray(response)
        ? response.map(mapUserFromAPI)
        : [];

      this._users.set([...users]);

    } catch (error) {
      console.error('Erro ao carregar todos os usuários:', error);
      this._users.set([]);
    } finally {
      this._isLoading.set(false);
    }
  }

  // =====================================================
  // CREATE USER
  // =====================================================

  async createUser(userData: any): Promise<User> {
    this._isLoading.set(true);

    try {
      const response = await firstValueFrom(
        this.apiService.createUser(userData)
      );

      const newUser = mapUserFromAPI(response);

      this._users.set([...this._users(), newUser]);

      this.notificationsService.addNotification(
        'system',
        `Utilizador "${newUser.name}" criado com sucesso.`,
        'success'
      );

      this.activitiesService.addActivity({
        type: 'user_added',
        userId: newUser.id,
        userName: newUser.name,
        description: `Utilizador adicionado: ${newUser.name}`
      });

      return newUser;

    } catch (error) {
      this.notificationsService.addNotification(
        'system',
        'Erro ao criar utilizador.',
        'error'
      );
      throw error;

    } finally {
      this._isLoading.set(false);
    }
  }

  // =====================================================
  // UPDATE USER
  // =====================================================

  async updateUser(id: string, userData: any): Promise<User> {
    this._isLoading.set(true);

    try {
      const response = await firstValueFrom(
        this.apiService.updateUser(id, userData)
      );

      const updatedUser = mapUserFromAPI(response);

      const updatedList = this._users().map(u =>
        u.id === id ? { ...updatedUser } : u
      );

      this._users.set([...updatedList]);

      this.notificationsService.addNotification(
        'system',
        `Utilizador "${updatedUser.name}" atualizado com sucesso.`,
        'success'
      );

      this.activitiesService.addActivity({
        type: 'user_updated',
        userId: updatedUser.id,
        userName: updatedUser.name,
        description: `Utilizador atualizado: ${updatedUser.name}`
      });

      return updatedUser;

    } catch (error) {
      this.notificationsService.addNotification(
        'system',
        'Erro ao atualizar utilizador.',
        'error'
      );
      throw error;

    } finally {
      this._isLoading.set(false);
    }
  }

  // =====================================================
  // DELETE USER
  // =====================================================

  async deleteUser(id: string): Promise<void> {
    const userToDelete = this._users().find(u => u.id === id);
    if (!userToDelete) return;

    this._isLoading.set(true);

    try {
      await firstValueFrom(
        this.apiService.deleteUser(id)
      );

      const filtered = this._users().filter(u => u.id !== id);
      this._users.set([...filtered]);

      this.notificationsService.addNotification(
        'system',
        `Utilizador "${userToDelete.name}" eliminado com sucesso.`,
        'success'
      );

      this.activitiesService.addActivity({
        type: 'user_deleted',
        userId: userToDelete.id,
        userName: userToDelete.name,
        description: `Utilizador eliminado: ${userToDelete.name}`
      });

    } catch (error) {
      this.notificationsService.addNotification(
        'system',
        'Erro ao eliminar utilizador.',
        'error'
      );
      throw error;

    } finally {
      this._isLoading.set(false);
    }
  }

  // =====================================================
  // CHANGE ROLE
  // =====================================================

  async changeUserRole(id: string, role: string): Promise<User> {
    this._isLoading.set(true);

    try {
      const response = await firstValueFrom(
        this.apiService.changeUserRole(id, role)
      );

      const updatedUser = mapUserFromAPI(response);

      const updatedList = this._users().map(u =>
        u.id === id ? { ...updatedUser } : u
      );

      this._users.set([...updatedList]);

      return updatedUser;

    } finally {
      this._isLoading.set(false);
    }
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  async changePassword(
    id: string,
    newPassword: string,
    oldPassword?: string
  ): Promise<void> {

    this._isLoading.set(true);

    try {
      await firstValueFrom(
        this.apiService.changePassword(id, newPassword, oldPassword)
      );

      const updatedUsers = this._users().map(user =>
        user.id === id
          ? { ...user, mustChangePassword: false }
          : user
      );

      this._users.set([...updatedUsers]);

      const updatedUser = this._users().find(u => u.id === id);

      if (updatedUser) {
        this.notificationsService.addNotification(
          'system',
          `Senha alterada com sucesso para "${updatedUser.name}".`,
          'success'
        );

        this.activitiesService.addActivity({
          type: 'password_changed',
          userId: updatedUser.id,
          userName: updatedUser.name,
          description: `Senha alterada para ${updatedUser.name}`
        });
      }

    } catch (error) {
      this.notificationsService.addNotification(
        'system',
        'Erro ao alterar senha. Verifique os dados e tente novamente.',
        'error'
      );
      throw error;

    } finally {
      this._isLoading.set(false);
    }
  }

  // =====================================================
  // HELPERS
  // =====================================================

  getUserById(id: string): User | undefined {
    return this._users().find(u => u.id === id);
  }

  getAvatarUrl(user: User): string | null {
    return user.avatar ?? null;
  }

  saveAvatar(userId: string, dataUrl: string): void {
    const updated = this._users().map(u =>
      u.id === userId ? { ...u, avatar: dataUrl } : u
    );

    this._users.set([...updated]);
    localStorage.setItem(`gestora_avatar_${userId}`, dataUrl);
  }
}