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

  // Signals públicos
  public notifications = this.notificationsSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();

  // Computed para contagem de não lidas
  public unreadCount = computed(() => {
    return this.notificationsSignal().filter(n => !n.read).length;
  });

  // Configuração: tempo mínimo entre requisições (em ms)
  private readonly MIN_FETCH_INTERVAL = 800000; // 30 segundos

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    // Effect apenas para log - não modifica signals
    effect(() => {
      const user = this.authService.user();
     
    });

    // Carregar notificações apenas se usuário estiver logado
    const currentUser = this.authService.user();
    if (currentUser) {
      this.loadNotifications();
    }
  }

  /**
   * Carrega notificações da API (apenas se necessário)
   * @param force - Força o carregamento mesmo dentro do intervalo mínimo
   */
  async loadNotifications(force: boolean = false): Promise<void> {
    // Verificar se já está carregando
    if (this.isLoadingSignal()) {
      
      return;
    }

    
    const now = Date.now();
    if (!force && now - this.lastFetchTimestamp() < this.MIN_FETCH_INTERVAL) {
     
      return;
    }

    this.isLoadingSignal.set(true);
    
    
    try {
      const response = await firstValueFrom(
        this.apiService.getNotifications()
      );
      
      const notifications = Array.isArray(response) 
        ? response.map((n: any) => this.mapNotificationFromAPI(n))
        : [];

      notifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      this.notificationsSignal.set(notifications);
      this.lastFetchTimestamp.set(now);
      
     
      
    } catch (error) {
    
      
      // Em caso de erro, manter os dados existentes
      // Não limpa o signal, apenas loga o erro
      
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Carrega apenas notificações não lidas (menos dados)
   */
  async loadUnreadNotifications(force: boolean = false): Promise<void> {
    // Verificar se já está carregando
    if (this.isLoadingSignal()) {
      
      return;
    }

    // Verificar intervalo mínimo entre requisições (a menos que seja forçado)
    const now = Date.now();
    if (!force && now - this.lastFetchTimestamp() < this.MIN_FETCH_INTERVAL) {
     
      return;
    }

    this.isLoadingSignal.set(true);
    
    
    try {
      const response = await firstValueFrom(
        this.apiService.getUnreadNotifications()
      );
      
      const unreadNotifications = Array.isArray(response) 
        ? response.map((n: any) => this.mapNotificationFromAPI(n))
        : [];

      unreadNotifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Atualizar o signal mantendo as notificações lidas existentes
      this.notificationsSignal.update(prev => {
        // Manter as notificações lidas que não estão na lista de não lidas
        const readNotifications = prev.filter(n => 
          n.read && !unreadNotifications.some(un => un.id === n.id)
        );
        
        // Combinar não lidas + lidas, ordenar por data
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

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(): Promise<void> {
  
    
    // Atualizar localmente IMEDIATAMENTE para feedback instantâneo
    this.notificationsSignal.update(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    
    try {
      // Tentar sincronizar com a API em background
      await firstValueFrom(
        this.apiService.markAllNotificationsAsRead()
      );
      
    
      
    } catch (error) {
      
      // Não revertemos a mudança local porque a UI já está atualizada
      // O próximo load vai corrigir se necessário
    }
  }

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(notificationId: string): Promise<void> {
 
    this.notificationsSignal.update(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    
    try {
      // Tentar sincronizar com a API em background
      await firstValueFrom(
        this.apiService.markNotificationAsRead(notificationId)
      );
      
      
      
    } catch (error) {
   
      // Não revertemos a mudança local
    }
  }

  /**
   * Adiciona uma nova notificação (apenas local, sem API)
   */
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

  /**
   * Remove uma notificação
   */
  removeNotification(notificationId: string): void {
    this.notificationsSignal.update(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  }

  /**
   * Limpa todas as notificações
   */
  clearNotifications(): void {

    this.notificationsSignal.set([]);
    this.lastFetchTimestamp.set(0);
  }

  /**
   * Recarrega as notificações (força atualização)
   */
  async refreshNotifications(): Promise<void> {
  
    await this.loadNotifications(true);
  }

  /**
   * Recarrega apenas não lidas (força atualização)
   */
  async refreshUnreadNotifications(): Promise<void> {
    
    await this.loadUnreadNotifications(true);
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

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