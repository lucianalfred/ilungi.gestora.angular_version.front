// src/app/services/activities.service.ts
import { Injectable, signal } from '@angular/core';

export interface Activity {
  type: string;
  taskId?: string;
  taskTitle?: string;
  userId?: string;
  userName?: string;
  fromStatus?: string;
  toStatus?: string;
  description: string;
  timestamp?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {
  private activitiesSignal = signal<Activity[]>([]);
  
  public activities = this.activitiesSignal.asReadonly();

  constructor() {}

  /**
   * Carrega atividades (implementar conforme sua lógica)
   */
  async loadActivities(): Promise<void> {
    // Implementar conforme sua necessidade
    
  }

  /**
   * Adiciona uma nova atividade
   */
  addActivity(activity: Activity): void {
    const newActivity = {
      ...activity,
      timestamp: activity.timestamp || new Date()
    };
    
    this.activitiesSignal.update(prev => [newActivity, ...prev].slice(0, 50));
  }

 
  clearActivities(): void {
    this.activitiesSignal.set([]);
  }
}