import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, User, UserRole, TaskStatus } from '../../../models/types';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-reports-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports-view.component.html',
  styleUrls: ['./reports-view.component.css']
})
export class ReportsViewComponent {
  @Input() tasks: Task[] = [];
  @Input() users: User[] = [];

  constructor(private languageService: LanguageService) {}

  get t() {
    return this.languageService.translations();
  }

  get employeeStats() {
    return this.users
      .filter(u => u.role === UserRole.USER || u.role === UserRole.ADMIN)
      .map(u => {
        const myTasks = this.tasks.filter(t => 
          t.responsibleId === u.id || t.intervenientes?.includes(u.id)
        );
        const total = myTasks.length;
        const completed = myTasks.filter(t => t.status === TaskStatus.FECHADO).length;
        const overdue = myTasks.filter(t => t.status === TaskStatus.ATRASADA).length;
        const complianceRate = total ? Math.round((completed / total) * 100) : 0;
        
        return {
          ...u,
          total,
          completed,
          overdue,
          complianceRate
        };
      })
      .sort((a, b) => b.complianceRate - a.complianceRate);
  }

  get totalTasks() {
    return this.tasks.length;
  }

  get completionRate() {
    return this.tasks.length 
      ? Math.round((this.tasks.filter(t => t.status === TaskStatus.FECHADO).length / this.tasks.length) * 100) 
      : 0;
  }

  get activeEmployees() {
    return this.users.filter(u => u.role === UserRole.USER).length;
  }

  getTaskStatusClass(rate: number): string {
    if (rate >= 70) return 'text-emerald-600';
    if (rate >= 40) return 'text-amber-600';
    return 'text-rose-600';
  }

  getProgressBarClass(rate: number): string {
    if (rate >= 70) return 'bg-emerald-600';
    if (rate >= 40) return 'bg-amber-600';
    return 'bg-rose-600';
  }
}