import { Injectable, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { Task, TaskStatus } from '../models/types';
import { mapTaskFromAPI } from '../utils/mapper';
import { NotificationsService } from './notifications.service';
import { ActivitiesService } from './activities.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private tasksSignal = signal<Task[]>([]);
  private isLoadingSignal = signal(false);
  private searchQuerySignal = signal('');
  private statusFilterSignal = signal<string>('all');
  
  private updatingTaskIdSignal = signal<string | null>(null);
  private deletingTaskIdSignal = signal<string | null>(null);

  public tasks = this.tasksSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();
  public searchQuery = this.searchQuerySignal.asReadonly();
  public statusFilter = this.statusFilterSignal.asReadonly();
  
  public updatingTaskId = this.updatingTaskIdSignal.asReadonly();
  public deletingTaskId = this.deletingTaskIdSignal.asReadonly();

  public filteredTasks = computed(() => {
    const tasks = this.tasksSignal();
    const search = this.searchQuerySignal().toLowerCase();
    const status = this.statusFilterSignal();

    return tasks.filter(task => {
      if (status !== 'all' && task.status !== status) return false;
      if (search) {
        return task.title.toLowerCase().includes(search) ||
               task.description?.toLowerCase().includes(search);
      }
      return true;
    });
  });

  public stats = computed(() => {
    const tasks = this.tasksSignal();
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === TaskStatus.PENDENTE).length,
      inProgress: tasks.filter(t => t.status === TaskStatus.EM_PROGRESSO).length,
      completed: tasks.filter(t => t.status === TaskStatus.TERMINADO).length,
      overdue: tasks.filter(t => t.status === TaskStatus.ATRASADA).length,
      closed: tasks.filter(t => t.status === TaskStatus.FECHADO).length
    };
  });

  constructor(
    private apiService: ApiService,
    private notificationsService: NotificationsService,
    private activitiesService: ActivitiesService,
    private authService: AuthService
  ) {}

  /**
   * Carrega tarefas baseado no papel do usuário
   */
  async loadTasks(): Promise<void> {
    if (this.isLoadingSignal()) {
      return;
    }

    this.isLoadingSignal.set(true);
    try {
      const isAdmin = this.authService.isAdmin();
      
      let response;
      if (isAdmin) {
        response = await firstValueFrom(this.apiService.getAllTasks());
      } else {
        response = await firstValueFrom(this.apiService.getMyTasks());
      }
      
      const tasks = Array.isArray(response) 
        ? response.map(mapTaskFromAPI)
        : [];
      
      this.tasksSignal.set(tasks);
      
      localStorage.setItem('gestora_tasks_last_load', Date.now().toString());

    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      this.tasksSignal.set([]);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Carrega todas as tarefas (apenas admin)
   */
  async loadAllTasks(): Promise<void> {
    if (!this.authService.isAdmin()) {
   
      return;
    }
    
    this.isLoadingSignal.set(true);
    try {
      const response = await firstValueFrom(this.apiService.getAllTasks());
      const tasks = Array.isArray(response) 
        ? response.map(mapTaskFromAPI)
        : [];
      this.tasksSignal.set(tasks);
    } catch (error) {
    
      this.tasksSignal.set([]);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Carrega apenas tarefas do usuário atual
   */
  async loadMyTasks(): Promise<void> {
    this.isLoadingSignal.set(true);
    try {
      const response = await firstValueFrom(this.apiService.getMyTasks());
      const tasks = Array.isArray(response) 
        ? response.map(mapTaskFromAPI)
        : [];
      this.tasksSignal.set(tasks);
    } catch (error) {
     
      this.tasksSignal.set([]);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Cria uma nova tarefa
   */
  async createTask(taskData: any): Promise<Task> {
    this.isLoadingSignal.set(true);
    try {
      let response;
      if (this.authService.isAdmin()) {
        response = await firstValueFrom(this.apiService.createTaskWithResponsibles(taskData));
      } else {
        response = await firstValueFrom(this.apiService.createTask(taskData));
      }
      
      const newTask = mapTaskFromAPI(response);
      
      this.tasksSignal.update(tasks => [...tasks, newTask]);
      
      this.notificationsService.addNotification(
        'system',
        `Tarefa "${newTask.title}" criada com sucesso.`,
        'success'
      );
      
      this.activitiesService.addActivity({
        type: 'task_created',
        taskId: newTask.id,
        taskTitle: newTask.title,
        description: `Tarefa criada: ${newTask.title}`
      });
      
      return newTask;
    } catch (error) {
      this.notificationsService.addNotification(
        'system',
        'Erro ao criar tarefa. Tente novamente.',
        'error'
      );
      throw error;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Atualiza uma tarefa existente
   */
  async updateTask(id: string, taskData: any): Promise<Task> {
    this.isLoadingSignal.set(true);
    try {
      const response = await firstValueFrom(this.apiService.updateTask(id, taskData));
      const updatedTask = mapTaskFromAPI(response);
      
      this.tasksSignal.update(tasks => 
        tasks.map(t => t.id === id ? updatedTask : t)
      );
      
      this.notificationsService.addNotification(
        'system',
        `Tarefa "${updatedTask.title}" atualizada com sucesso.`,
        'success'
      );
      
      this.activitiesService.addActivity({
        type: 'task_updated',
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
        description: `Tarefa atualizada: ${updatedTask.title}`
      });
      
      return updatedTask;
    } catch (error) {
      this.notificationsService.addNotification(
        'system',
        'Erro ao atualizar tarefa. Tente novamente.',
        'error'
      );
      throw error;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Remove uma tarefa
   */
  async deleteTask(task: Task): Promise<void> {
    this.deletingTaskIdSignal.set(task.id);
    
    try {
      await firstValueFrom(this.apiService.deleteTask(task.id));
      
      this.tasksSignal.update(tasks => tasks.filter(t => t.id !== task.id));
      
      this.notificationsService.addNotification(
        'system',
        `Tarefa "${task.title}" eliminada com sucesso.`,
        'success'
      );
      
      this.activitiesService.addActivity({
        type: 'task_deleted',
        taskId: task.id,
        taskTitle: task.title,
        description: `Tarefa eliminada: ${task.title}`
      });
    } catch (error) {
      this.notificationsService.addNotification(
        'system',
        'Erro ao eliminar tarefa. Tente novamente.',
        'error'
      );
      throw error;
    } finally {
      this.deletingTaskIdSignal.set(null);
    }
  }

  /**
   * Avança o status de uma tarefa
   */
  async advanceStatus(task: Task): Promise<void> {
    this.updatingTaskIdSignal.set(task.id);
    
    try {
      let nextStatus: TaskStatus;
      switch (task.status) {
        case TaskStatus.PENDENTE:
          nextStatus = TaskStatus.EM_PROGRESSO;
          break;
        case TaskStatus.EM_PROGRESSO:
          nextStatus = TaskStatus.TERMINADO;
          break;
        case TaskStatus.TERMINADO:
          nextStatus = TaskStatus.FECHADO;
          break;
        default:
          this.updatingTaskIdSignal.set(null);
          return;
      }
      
      await firstValueFrom(this.apiService.updateTaskStatus(task.id, nextStatus));
      
      this.tasksSignal.update(tasks => 
        tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t)
      );
      
      this.activitiesService.addActivity({
        type: 'status_changed',
        taskId: task.id,
        taskTitle: task.title,
        fromStatus: task.status,
        toStatus: nextStatus,
        description: `Status alterado: ${task.status} → ${nextStatus}`
      });
    } catch (error) {
      throw error;
    } finally {
      this.updatingTaskIdSignal.set(null);
    }
  }

  /**
   * Regride o status de uma tarefa
   */
  async regressStatus(task: Task): Promise<void> {
    this.updatingTaskIdSignal.set(task.id);
    
    try {
      let prevStatus: TaskStatus;
      switch (task.status) {
        case TaskStatus.EM_PROGRESSO:
          prevStatus = TaskStatus.PENDENTE;
          break;
        case TaskStatus.TERMINADO:
          prevStatus = TaskStatus.EM_PROGRESSO;
          break;
        case TaskStatus.FECHADO:
          prevStatus = TaskStatus.TERMINADO;
          break;
        default:
          this.updatingTaskIdSignal.set(null);
          return;
      }
      
      await firstValueFrom(this.apiService.updateTaskStatus(task.id, prevStatus));
      
      this.tasksSignal.update(tasks => 
        tasks.map(t => t.id === task.id ? { ...t, status: prevStatus } : t)
      );
      
      this.activitiesService.addActivity({
        type: 'status_changed',
        taskId: task.id,
        taskTitle: task.title,
        fromStatus: task.status,
        toStatus: prevStatus,
        description: `Status alterado: ${task.status} → ${prevStatus}`
      });
    } catch (error) {
      throw error;
    } finally {
      this.updatingTaskIdSignal.set(null);
    }
  }

  /**
   * Adiciona um comentário a uma tarefa
   */
  async addComment(taskId: string, text: string): Promise<void> {
    this.updatingTaskIdSignal.set(taskId);
    
    try {
      await firstValueFrom(this.apiService.createComment(taskId, text));
      
      await this.loadTasks();
      
      this.activitiesService.addActivity({
        type: 'comment_added',
        taskId: taskId,
        description: `Comentário adicionado à tarefa`
      });
    } catch (error) {
      throw error;
    } finally {
      this.updatingTaskIdSignal.set(null);
    }
  }

  /**
   * Aplica filtros às tarefas
   */
  filterTasks(filters: { search?: string; status?: string }): void {
    if (filters.search !== undefined) {
      this.searchQuerySignal.set(filters.search);
    }
    if (filters.status !== undefined) {
      this.statusFilterSignal.set(filters.status);
    }
  }

  /**
   * Busca uma tarefa por ID
   */
  getTaskById(id: string): Task | undefined {
    return this.tasksSignal().find(t => t.id === id);
  }

  /**
   * Limpa os filtros aplicados
   */
  clearFilters(): void {
    this.searchQuerySignal.set('');
    this.statusFilterSignal.set('all');
  }

  /**
   * Recarrega as tarefas (força atualização)
   */
  async refreshTasks(): Promise<void> {
    await this.loadTasks();
  }
}