import { Injectable, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { User, UserRole } from '../models/types';
import { mapUserFromAPI } from '../utils/mapper';
import { NotificationsService } from './notifications.service';
import { ActivitiesService } from './activities.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private usersSignal = signal<User[]>([]);
  private isLoadingSignal = signal(false);

  // Signals públicos
  public users = this.usersSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();

  // Computed signals
  public admins = computed(() => 
    this.usersSignal().filter(u => u.role === UserRole.ADMIN)
  );
  
  public employees = computed(() => 
    this.usersSignal().filter(u => u.role === UserRole.USER)
  );

  constructor(
    private apiService: ApiService,
    private notificationsService: NotificationsService,
    private activitiesService: ActivitiesService
  ) {}

  async loadUsers() {
    this.isLoadingSignal.set(true);
    try {
      const response = await this.apiService.getAdminUsers().toPromise();
      const users = Array.isArray(response) 
        ? response.map(mapUserFromAPI)
        : [];
      this.usersSignal.set(users);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      this.usersSignal.set([]);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async loadAllUsers() {
    this.isLoadingSignal.set(true);
    try {
      const response = await this.apiService.getUsers().toPromise();
      const users = Array.isArray(response) 
        ? response.map(mapUserFromAPI)
        : [];
      this.usersSignal.set(users);
    } catch (error) {
      console.error('Erro ao carregar todos os usuários:', error);
      this.usersSignal.set([]);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async createUser(userData: any): Promise<User> {
    this.isLoadingSignal.set(true);
    try {
      const response = await this.apiService.createUser(userData).toPromise();
      const newUser = mapUserFromAPI(response);
      
      this.usersSignal.update(users => [...users, newUser]);
      
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
      console.error('Erro ao criar usuário:', error);
      this.notificationsService.addNotification(
        'system',
        'Erro ao criar utilizador. Tente novamente.',
        'error'
      );
      throw error;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async changePassword(id: string, password: string, oldPassword?: string): Promise<any> {
    this.isLoadingSignal.set(true);
    try {
      return await this.apiService.changePassword(id, password, oldPassword).toPromise();
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }
  async updateUser(id: string, userData: any): Promise<User> {
    this.isLoadingSignal.set(true);
    try {
      const response = await this.apiService.updateUser(id, userData).toPromise();
      const updatedUser = mapUserFromAPI(response);
      
      this.usersSignal.update(users => 
        users.map(u => u.id === id ? updatedUser : u)
      );
      
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
      console.error('Erro ao atualizar usuário:', error);
      this.notificationsService.addNotification(
        'system',
        'Erro ao atualizar utilizador. Tente novamente.',
        'error'
      );
      throw error;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async deleteUser(id: string): Promise<void> {
    const userToDelete = this.usersSignal().find(u => u.id === id);
    if (!userToDelete) return;

    this.isLoadingSignal.set(true);
    try {
      await this.apiService.deleteUser(id).toPromise();
      
      this.usersSignal.update(users => users.filter(u => u.id !== id));
      
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
      console.error('Erro ao eliminar usuário:', error);
      this.notificationsService.addNotification(
        'system',
        'Erro ao eliminar utilizador. Tente novamente.',
        'error'
      );
      throw error;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async changeUserRole(id: string, role: string): Promise<User> {
    this.isLoadingSignal.set(true);
    try {
      const response = await this.apiService.changeUserRole(id, role).toPromise();
      const updatedUser = mapUserFromAPI(response);
      
      this.usersSignal.update(users => 
        users.map(u => u.id === id ? updatedUser : u)
      );
      
      this.notificationsService.addNotification(
        'system',
        `Perfil do utilizador "${updatedUser.name}" alterado para ${role}.`,
        'success'
      );
      
      return updatedUser;
    } catch (error) {
      console.error('Erro ao alterar perfil:', error);
      this.notificationsService.addNotification(
        'system',
        'Erro ao alterar perfil do utilizador.',
        'error'
      );
      throw error;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  getUserById(id: string): User | undefined {
    return this.usersSignal().find(u => u.id === id);
  }

  getAvatarUrl(user: User): string | null {
    return user.avatar || null;
  }

  saveAvatar(userId: string, dataUrl: string): void {
    this.usersSignal.update(users => 
      users.map(u => u.id === userId ? { ...u, avatar: dataUrl } : u)
    );
    localStorage.setItem(`gestora_avatar_${userId}`, dataUrl);
  }
}