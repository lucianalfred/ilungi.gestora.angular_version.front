import { Injectable, signal, computed, effect } from '@angular/core';
import { ApiService } from './api.service';
import { Notification } from '../models/types';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private notificationsSignal = signal<Notification[]>([]);
  private isLoadingSignal = signal(false);
  private lastFetchTimestamp = signal<number>(0);

  public notifications = this.notificationsSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();

  public unreadCount = computed(() => {
    return this.notificationsSignal().filter(n => !n.read).length;
  });

  private readonly MIN_FETCH_INTERVAL = 3600000; // 1 minuto

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    
    effect(() => {
      const user = this.authService.user();
      if (user) {
    
        setTimeout(() => this.loadNotifications(true), 0);
      } else {
      
        setTimeout(() => this.clearNotifications(), 0);
      }
    }, { allowSignalWrites: true }); 
  }

  async loadNotifications(force: boolean = false): Promise<void> {
    if (this.isLoadingSignal()) {
      return;
    }

    const now = Date.now();
    if (!force && now - this.lastFetchTimestamp() < this.MIN_FETCH_INTERVAL) {
      return;
    }

    this.isLoadingSignal.set(true);
    
    try {
      const response = await firstValueFrom(this.apiService.getNotifications());
      
      const notifications = Array.isArray(response) 
        ? response.map((n: any) => this.mapNotificationFromAPI(n))
        : [];

      notifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

 
      this.notificationsSignal.set(notifications);
      this.lastFetchTimestamp.set(now);
      
      localStorage.setItem('gestora_notifications', JSON.stringify(notifications));
      
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      
      const cached = localStorage.getItem('gestora_notifications');
      if (cached) {
        try {
          this.notificationsSignal.set(JSON.parse(cached));
        } catch (e) {
  
        }
      }
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async loadUnreadNotifications(force: boolean = false): Promise<void> {
    if (this.isLoadingSignal()) {
      return;
    }

    const now = Date.now();
    if (!force && now - this.lastFetchTimestamp() < this.MIN_FETCH_INTERVAL) {
      return;
    }

    this.isLoadingSignal.set(true);
    
    try {
      const response = await firstValueFrom(this.apiService.getUnreadNotifications());
      
      const unreadNotifications = Array.isArray(response) 
        ? response.map((n: any) => this.mapNotificationFromAPI(n))
        : [];

      unreadNotifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      this.notificationsSignal.update(prev => {
        const readNotifications = prev.filter(n => 
          n.read && !unreadNotifications.some(un => un.id === n.id)
        );
        
        const combined = [...unreadNotifications, ...readNotifications].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        return combined;
      });

      this.lastFetchTimestamp.set(now);
      
    } catch (error) {
 
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async markAllAsRead(): Promise<void> {
    this.notificationsSignal.update(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    
    try {
      await firstValueFrom(this.apiService.markAllNotificationsAsRead());
    } catch (error) {

    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    this.notificationsSignal.update(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    
    try {
      await firstValueFrom(this.apiService.markNotificationAsRead(notificationId));
    } catch (error) {

    }
  }

  addNotification(userId: string, message: string, type: 'info' | 'success' | 'error' = 'info'): void {
    const notification: Notification = {
      id: `local-${Date.now()}`,
      userId,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notificationsSignal.update(prev => {
      return [notification, ...prev].slice(0, 50);
    });
  }

  removeNotification(notificationId: string): void {
    this.notificationsSignal.update(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  }

  clearNotifications(): void {
    
    this.notificationsSignal.set([]);
    this.lastFetchTimestamp.set(0);
    localStorage.removeItem('gestora_notifications');
  }

  async refreshNotifications(): Promise<void> {
    await this.loadNotifications(true);
  }

  async refreshUnreadNotifications(): Promise<void> {
    await this.loadUnreadNotifications(true);
  }

  private mapNotificationFromAPI(apiNotification: any): Notification {
    return {
      id: apiNotification.id?.toString() || Date.now().toString(),
      userId: apiNotification.userId?.toString() || apiNotification.createdBy?.id?.toString() || '',
      message: apiNotification.content || apiNotification.message || 'Notificação sem mensagem',
      type: this.mapNotificationType(apiNotification.notificationType || apiNotification.type),
      timestamp: apiNotification.createdAt || apiNotification.timestamp || new Date().toISOString(),
      read: apiNotification.status === 'LIDA' || apiNotification.read || false,
      title: apiNotification.title,
      taskId: apiNotification.taskId?.toString()
    };
  }

  private mapNotificationType(type: string): 'info' | 'success' | 'error' {
    switch (type?.toLowerCase()) {
      case 'success':
      case 'sucesso':
        return 'success';
      case 'error':
      case 'erro':
        return 'error';
      default:
        return 'info';
    }
  }
}