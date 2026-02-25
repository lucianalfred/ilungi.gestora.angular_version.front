import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { Task, User, TaskStatus, UserRole } from '../../../models/types';
import { LanguageService } from '../../../services/language.service';
import { TasksService } from '../../../services/tasks.service';

@Component({
  selector: 'app-tasks-view',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IconComponent, 
    ButtonComponent,
    TaskCardComponent,
    TaskModalComponent
  ],
  templateUrl: './tasks-view.component.html',
  styleUrls: ['./tasks-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksViewComponent {
  @Input() users: User[] = [];
  @Input() user!: User;
  @Input() searchQuery: string = '';
  @Input() statusFilter: string = 'all';
  @Input() isLoading: boolean = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() statusFilterChange = new EventEmitter<string>();
  @Output() advanceStatus = new EventEmitter<Task>();
  @Output() regressStatus = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<Task>();
  @Output() addComment = new EventEmitter<{ taskId: string; text: string }>();
  @Output() createTask = new EventEmitter<void>();

  isTaskModalOpen = false;
  editingTaskId: string | null = null;

  constructor(
    private languageService: LanguageService,
    public tasksService: TasksService
  ) {}

  get t() {
    return this.languageService.translations() || {};
  }

  get TaskStatus() {
    return TaskStatus;
  }

  get UserRole() {
    return UserRole;
  }

  get showTaskForm(): boolean {
    return this.isTaskModalOpen || !!this.editingTaskId;
  }

  get statusOptions(): { value: string; label: string }[] {
    return Object.values(TaskStatus).map(status => ({
      value: status,
      label: status
    }));
  }

  // Usa o filteredTasks do serviço
  get filteredTasks() {
    return this.tasksService.filteredTasks();
  }

  
  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

 
  getEditHandler(taskId: string): (() => void) | null {
    if (this.user && this.user.role === UserRole.ADMIN) {
      return () => this.openEditTaskModal(taskId);
    }
    return null;
  }

  openCreateTaskModal(): void {
    this.editingTaskId = null;
    this.isTaskModalOpen = true;
    this.createTask.emit();
  }

  openEditTaskModal(taskId: string): void {
    this.editingTaskId = taskId;
    this.isTaskModalOpen = true;
  }

  closeTaskModal(): void {
    this.isTaskModalOpen = false;
    this.editingTaskId = null;
  }

  onAdvanceTask(task: Task): void {
    this.advanceStatus.emit(task);
  }

  onRegressTask(task: Task): void {
    if (this.regressStatus) {
      this.regressStatus.emit(task);
    }
  }

  onDeleteTask(task: Task): void {
    this.deleteTask.emit(task);
  }

  onAddCommentToTask(taskId: string, text: string): void {
    this.addComment.emit({ taskId, text });
  }
}