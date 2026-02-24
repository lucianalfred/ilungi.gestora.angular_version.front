import { Injectable, signal } from '@angular/core';
import { Notification } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private notificationsSignal = signal<Notification[]>([]);
  private lastNotificationMap = new Map<string, number>();

  // Signal público
  public notifications = this.notificationsSignal.asReadonly();

  constructor() {
    // Carregar notificações salvas (opcional)
    this.loadStoredNotifications();
  }

  private loadStoredNotifications() {
    const stored = localStorage.getItem('gestora_notifications');
    if (stored) {
      try {
        const notifications = JSON.parse(stored);
        this.notificationsSignal.set(notifications);
      } catch (e) {
        console.error('Erro ao carregar notificações:', e);
      }
    }
  }

  private saveNotifications() {
    localStorage.setItem('gestora_notifications', JSON.stringify(this.notificationsSignal()));
  }

  addNotification(userId: string, message: string, type: 'info' | 'success' | 'error' = 'info'): void {
    const now = Date.now();
    const key = `${userId}|${type}|${message}`;
    const lastAt = this.lastNotificationMap.get(key) || 0;
    
    // Evitar notificações duplicadas em menos de 5 segundos
    if (now - lastAt < 5000) return;
    
    this.lastNotificationMap.set(key, now);

    const notification: Notification = {
      id: Math.random().toString(36).substring(2, 9),
      userId,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notificationsSignal.update(prev => {
      // Verificar se já existe uma notificação similar recente
      const exists = prev.some(n => 
        n.userId === userId && 
        n.message === message && 
        n.type === type && 
        Math.abs(new Date(n.timestamp).getTime() - now) < 10000
      );
      
      if (exists) return prev;
      
      const updated = [notification, ...prev].slice(0, 50); // Manter apenas as últimas 50
      this.saveNotifications();
      return updated;
    });
  }

  markAsRead(notificationId: string): void {
    this.notificationsSignal.update(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    this.saveNotifications();
  }

  markAllAsRead(): void {
    this.notificationsSignal.update(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    this.saveNotifications();
  }

  clearNotifications(): void {
    this.notificationsSignal.set([]);
    this.saveNotifications();
  }

  removeNotification(notificationId: string): void {
    this.notificationsSignal.update(prev => 
      prev.filter(n => n.id !== notificationId)
    );
    this.saveNotifications();
  }

  getUnreadCount(): number {
    return this.notificationsSignal().filter(n => !n.read).length;
  }

  getNotificationsForUser(userId: string): Notification[] {
    return this.notificationsSignal().filter(n => n.userId === userId);
  }
}