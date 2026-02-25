import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { Task, User, TaskStatus, UserRole } from '../../../models/types';
import { TasksService } from '../../../services/tasks.service';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ButtonComponent],
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.css']
})
export class TaskModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() editingTaskId: string | null = null;
  @Output() onClose = new EventEmitter<void>();

  tasks: Task[] = [];
  users: User[] = [];
  isLoading = false;
  taskFormError: string | null = null;
  taskFormDeliveryPreview = '';
  responsibleSearch = '';
  selectedCount = 0;

  // Dados do formulário
  formData = {
    title: '',
    description: '',
    startDate: '',
    deadlineValue: 1,
    deadlineType: 'days' as 'days' | 'hours',
    responsibleIds: [] as string[]
  };

  constructor(
    private tasksService: TasksService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadTasks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingTaskId'] && this.editingTaskId) {
      this.loadTaskForEdit();
    }
    if (changes['isOpen'] && !this.isOpen) {
      this.resetForm();
    }
  }

  get editTask(): Task | null {
    if (!this.editingTaskId) return null;
    return this.tasks.find(t => t.id === this.editingTaskId) || null;
  }

  get respIds(): string[] {
    if (!this.editTask) return [];
    return [this.editTask.responsibleId, ...(this.editTask.intervenientes || [])];
  }

  get hasUsers(): boolean {
    return this.users && this.users.length > 0;
  }

  get filteredUsers(): User[] {
    if (!this.hasUsers) return [];
    
    const searchLower = this.responsibleSearch.toLowerCase();
    return this.users.filter(user => 
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  }

  loadUsers(): void {
 
    this.usersService.loadUsers();
    this.users = this.usersService.users(); 
  }

  loadTasks(): void {
    // Se tasksService também usa signals
    this.tasksService.loadTasks();
    this.tasks = this.tasksService.tasks(); 
  }

  loadTaskForEdit(): void {
    if (this.editTask) {
      this.formData = {
        title: this.editTask.title,
        description: this.editTask.description,
        startDate: this.editTask.startDate?.slice(0, 16) || '',
        deadlineValue: this.editTask.deadlineValue || 1,
        deadlineType: this.editTask.deadlineType || 'days',
        responsibleIds: this.respIds
      };
      this.selectedCount = this.respIds.length;
      this.recalcDelivery();
    }
  }

  resetForm(): void {
    this.formData = {
      title: '',
      description: '',
      startDate: '',
      deadlineValue: 1,
      deadlineType: 'days',
      responsibleIds: []
    };
    this.taskFormError = null;
    this.taskFormDeliveryPreview = '';
    this.responsibleSearch = '';
    this.selectedCount = 0;
  }

  recalcDelivery(): void {
    if (this.formData.startDate && this.formData.deadlineValue) {
      const d = new Date(this.formData.startDate);
      if (this.formData.deadlineType === 'days') {
        d.setDate(d.getDate() + Number(this.formData.deadlineValue));
      } else {
        d.setHours(d.getHours() + Number(this.formData.deadlineValue));
      }
      
      this.taskFormDeliveryPreview = d.toLocaleString('pt-PT', { 
        dateStyle: 'short', 
        timeStyle: 'short' 
      });
    } else {
      this.taskFormDeliveryPreview = '';
    }
  }

  handleSelectAllResponsibles(): void {
    const allChecked = this.filteredUsers.every(u => 
      this.formData.responsibleIds.includes(u.id)
    );
    
    if (allChecked) {
      this.formData.responsibleIds = [];
    } else {
      this.formData.responsibleIds = this.filteredUsers.map(u => u.id);
    }
    
    this.selectedCount = this.formData.responsibleIds.length;
  }

  handleResponsibleChange(userId: string, checked: boolean): void {
    if (checked) {
      this.formData.responsibleIds.push(userId);
    } else {
      this.formData.responsibleIds = this.formData.responsibleIds.filter(id => id !== userId);
    }
    this.selectedCount = this.formData.responsibleIds.length;
  }

  isResponsibleChecked(userId: string): boolean {
    return this.formData.responsibleIds.includes(userId);
  }

  async handleSubmit(): Promise<void> {
    if (this.formData.responsibleIds.length === 0) {
      this.taskFormError = 'Selecione pelo menos um responsável.';
      return;
    }
    
    this.taskFormError = null;
    this.isLoading = true;
    
    const daysToFinish = this.formData.deadlineType === 'days' 
      ? this.formData.deadlineValue 
      : Math.ceil(this.formData.deadlineValue / 24);

    try {
      if (this.editingTaskId) {
        await this.tasksService.updateTask(this.editingTaskId, {
          title: this.formData.title,
          description: this.formData.description,
          startDate: this.formData.startDate,
          deadlineValue: this.formData.deadlineValue,
          deadlineType: this.formData.deadlineType,
          responsibleId: this.formData.responsibleIds[0],
          intervenientes: this.formData.responsibleIds.slice(1)
        });
      } else {
        await this.tasksService.createTask({
          title: this.formData.title,
          description: this.formData.description,
          daysToFinish,
          responsibles: this.formData.responsibleIds
        });
      }
      this.onClose.emit();
    } catch (error: any) {
      let errorMsg = 'Não foi possível criar/atualizar na API.';
      if (error.message?.includes('400')) {
        errorMsg = 'Formato de dados inválido. Verifique os responsáveis.';
      } else if (error.message?.includes('401')) {
        errorMsg = 'Acesso não autorizado. Faça login novamente.';
      } else if (error.message?.includes('403')) {
        errorMsg = 'Sem permissão para realizar esta ação.';
      }
      this.taskFormError = errorMsg;
    } finally {
      this.isLoading = false;
    }
  }
}