import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal, ChangeDetectorRef } from '@angular/core';
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
  @Output() onCreate = new EventEmitter<any>();

  tasks: Task[] = [];
  users: User[] = [];
  isLoading = false;
  taskFormError: string | null = null;
  taskFormDeliveryPreview = '';
  responsibleSearch = '';
  selectedCount = 0;

  // ✅ USANDO SIGNALS PARA OS CAMPOS DO FORMULÁRIO
  title = signal('');
  description = signal('');
  startDate = signal('');
  deadlineValue = signal(1);
  deadlineType = signal<'days' | 'hours'>('days');
  responsibleIds = signal<string[]>([]);

  constructor(
    private tasksService: TasksService,
    private usersService: UsersService,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
   ;
    this.loadUsers();
    this.loadTasks();
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    
    if (changes['editingTaskId']) {
      
    }
    
    if (changes['editingTaskId'] && this.editingTaskId) {
     
      setTimeout(() => {
        this.loadTaskForEdit();
      }, 100);
    }
    
    if (changes['isOpen'] && !this.isOpen) {
     
      this.resetForm();
    }
  }

  // ✅ GETTERS E SETTERS PARA TWO-WAY BINDING
  get titleValue(): string {
    return this.title();
  }
  set titleValue(value: string) {
    this.title.set(value);
  }

  get descriptionValue(): string {
    return this.description();
  }
  set descriptionValue(value: string) {
    this.description.set(value);
  }

  get startDateValue(): string {
    return this.startDate();
  }
  set startDateValue(value: string) {
    this.startDate.set(value);
  }

  get deadlineValueValue(): number {
    return this.deadlineValue();
  }
  set deadlineValueValue(value: number) {
    this.deadlineValue.set(value);
  }

  get deadlineTypeValue(): 'days' | 'hours' {
    return this.deadlineType();
  }
  set deadlineTypeValue(value: 'days' | 'hours') {
    this.deadlineType.set(value);
  }

  get editTask(): Task | null {
    if (!this.editingTaskId) {
      return null;
    }
    
   
    const found = this.tasks.find(t => t.id === this.editingTaskId);
    
  
    return found || null;
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
   
    this.tasksService.loadTasks();
    this.tasks = this.tasksService.tasks();
    
  }

  loadTaskForEdit(): void {
    
    
    if (this.editTask) {
      
      
      
      this.title.set(this.editTask.title || '');
      this.description.set(this.editTask.description || '');
      this.startDate.set(this.editTask.startDate?.slice(0, 16) || '');
      this.deadlineValue.set(this.editTask.deadlineValue || 1);
      this.deadlineType.set(this.editTask.deadlineType || 'days');
      
      const responsibleIds = [this.editTask.responsibleId, ...(this.editTask.intervenientes || [])];
      this.responsibleIds.set(responsibleIds);
      
      this.selectedCount = responsibleIds.length;
      this.taskFormError = null;
      
      
      
      this.recalcDelivery();
      
      
      setTimeout(() => {
        this.cdr.detectChanges();
   
      }, 50);
      
    } else {
      
    }
  }

  resetForm(): void {
   
    
    this.title.set('');
    this.description.set('');
    this.startDate.set('');
    this.deadlineValue.set(1);
    this.deadlineType.set('days');
    this.responsibleIds.set([]);
    
    this.taskFormError = null;
    this.taskFormDeliveryPreview = '';
    this.responsibleSearch = '';
    this.selectedCount = 0;
    

  }

  recalcDelivery(): void {
    if (this.startDate() && this.deadlineValue()) {
      const d = new Date(this.startDate());
      if (this.deadlineType() === 'days') {
        d.setDate(d.getDate() + Number(this.deadlineValue()));
      } else {
        d.setHours(d.getHours() + Number(this.deadlineValue()));
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
      this.responsibleIds().includes(u.id)
    );
    
    if (allChecked) {
      this.responsibleIds.set([]);
    } else {
      this.responsibleIds.set(this.filteredUsers.map(u => u.id));
    }
    
    this.selectedCount = this.responsibleIds().length;
  }

  handleResponsibleChange(userId: string, checked: boolean): void {
    const currentIds = this.responsibleIds();
    
    if (checked) {
      this.responsibleIds.set([...currentIds, userId]);
    } else {
      this.responsibleIds.set(currentIds.filter(id => id !== userId));
    }
    
    this.selectedCount = this.responsibleIds().length;
  }

  isResponsibleChecked(userId: string): boolean {
    return this.responsibleIds().includes(userId);
  }

  async handleSubmit(): Promise<void> {
    if (this.responsibleIds().length === 0) {
      this.taskFormError = 'Selecione pelo menos um responsável.';
      return;
    }
    
    this.taskFormError = null;
    this.isLoading = true;
    
    const daysToFinish = this.deadlineType() === 'days' 
      ? this.deadlineValue() 
      : Math.ceil(this.deadlineValue() / 24);

    try {
      const taskData = {
        title: this.title(),
        description: this.description(),
        startDate: this.startDate(),
        deadlineValue: this.deadlineValue(),
        deadlineType: this.deadlineType(),
        responsibleId: this.responsibleIds()[0],
        intervenientes: this.responsibleIds().slice(1)
      };

      if (this.editingTaskId) {
       
        await this.tasksService.updateTask(this.editingTaskId, taskData);
      } else {
     
        await this.tasksService.createTask({
          title: this.title(),
          description: this.description(),
          daysToFinish,
          responsibles: this.responsibleIds()
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