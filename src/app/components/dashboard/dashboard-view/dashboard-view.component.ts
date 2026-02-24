import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { StatCardComponent } from '../../shared/stat-card/stat-card.component';
import { Task, User, TaskStatus } from '../../../models/types';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, IconComponent, StatCardComponent],
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.css']
})
export class DashboardViewComponent implements OnInit {
  @Input() stats!: { active: number; overdue: number; completed: number };
  @Input() tasks: Task[] = [];
  @Input() users: User[] = [];
  @Input() user!: User;

  // Valores padrão para evitar undefined
  protected localStats = { active: 0, overdue: 0, completed: 0 };
  protected localTasks: Task[] = [];

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    // Inicializa com valores seguros
    if (this.stats) {
      this.localStats = this.stats;
    }
    if (this.tasks) {
      this.localTasks = this.tasks;
    }
  }

  get t() {
    return this.languageService.translations() || {};
  }

  get tasksByStatus() {
    const tasks = this.localTasks;
    
    return Object.values(TaskStatus).map(status => ({
      status,
      count: tasks.filter(t => t?.status === status).length
    }));
  }

  get TaskStatus() {
    return TaskStatus;
  }
}