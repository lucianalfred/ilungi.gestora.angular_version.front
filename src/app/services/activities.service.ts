import { Injectable, signal } from '@angular/core';
import { Activity } from '../models/types';

interface ActivityInput {
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'status_changed' | 'comment_added' | 'user_added' | 'user_updated' | 'user_deleted';
  userId?: string;
  userName?: string;
  taskId?: string;
  taskTitle?: string;
  fromStatus?: string;
  toStatus?: string;
  description: string;
  metadata?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {
  private activitiesSignal = signal<Activity[]>([]);

  // Signal público
  public activities = this.activitiesSignal.asReadonly();

  constructor() {
    this.loadStoredActivities();
  }

  private loadStoredActivities() {
    const stored = localStorage.getItem('gestora_activities');
    if (stored) {
      try {
        const activities = JSON.parse(stored);
        this.activitiesSignal.set(activities);
      } catch (e) {
        console.error('Erro ao carregar atividades:', e);
      }
    }
  }

  private saveActivities() {
    // Manter apenas as últimas 200 atividades
    const activities = this.activitiesSignal().slice(0, 200);
    localStorage.setItem('gestora_activities', JSON.stringify(activities));
  }

  addActivity(input: ActivityInput): Activity {
    const activity: Activity = {
      id: `A-${Math.random().toString(36).substring(2, 9)}`,
      type: input.type,
      userId: input.userId || 'system',
      userName: input.userName || 'Sistema',
      taskId: input.taskId,
      taskTitle: input.taskTitle,
      description: input.description,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      metadata: input.metadata,
      timestamp: new Date().toISOString()
    };

    this.activitiesSignal.update(prev => {
      // Verificar duplicatas
      const exists = prev.some(a => 
        a.userId === activity.userId && 
        a.type === activity.type && 
        a.taskId === activity.taskId && 
        a.fromStatus === activity.fromStatus && 
        a.toStatus === activity.toStatus &&
        Math.abs(new Date(a.timestamp).getTime() - new Date(activity.timestamp).getTime()) < 5000
      );

      if (exists) return prev;

      const updated = [activity, ...prev];
      this.saveActivities();
      return updated;
    });

    return activity;
  }

  getActivitiesForUser(userId: string): Activity[] {
    return this.activitiesSignal().filter(a => a.userId === userId);
  }

  getActivitiesForTask(taskId: string): Activity[] {
    return this.activitiesSignal().filter(a => a.taskId === taskId);
  }

  getRecentActivities(limit: number = 20): Activity[] {
    return this.activitiesSignal().slice(0, limit);
  }

  clearActivities(): void {
    this.activitiesSignal.set([]);
    localStorage.removeItem('gestora_activities');
  }
}