import { Injectable, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { Task, TaskStatus } from '../models/types';
import { mapTaskFromAPI } from '../utils/mapper';
import { NotificationsService } from './notifications.service';
import { ActivitiesService } from './activities.service';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private tasksSignal = signal<Task[]>([]);
  private isLoadingSignal = signal(false);
  private searchQuerySignal = signal('');
  private statusFilterSignal = signal<string>('all');
  
  // 🔥 NOVO: Signal para controlar loading de cada tarefa individualmente
  private updatingTaskIdSignal = signal<string | null>(null);
  private deletingTaskIdSignal = signal<string | null>(null);

  // Signals públicos
  public tasks = this.tasksSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();
  public searchQuery = this.searchQuerySignal.asReadonly();
  public statusFilter = this.statusFilterSignal.asReadonly();
  
  // 🔥 Signals para loading de tarefas individuais
  public updatingTaskId = this.updatingTaskIdSignal.asReadonly();
  public deletingTaskId = this.deletingTaskIdSignal.asReadonly();

  // Computed signals
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
    private activitiesService: ActivitiesService
  ) {}

  async loadTasks() {
    this.isLoadingSignal.set(true);
    try {
      const response = await firstValueFrom(this.apiService.getMyTasks());
      const tasks = Array.isArray(response) 
        ? response.map(mapTaskFromAPI)
        : [];
      this.tasksSignal.set(tasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      this.tasksSignal.set([]);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async loadAllTasks() {
    this.isLoadingSignal.set(true);
    try {
      const response = await firstValueFrom(this.apiService.getAllTasks());
      const tasks = Array.isArray(response) 
        ? response.map(mapTaskFromAPI)
        : [];
      this.tasksSignal.set(tasks);
    } catch (error) {
      console.error('Erro ao carregar todas as tarefas:', error);
      this.tasksSignal.set([]);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async createTask(taskData: any): Promise<Task> {
    this.isLoadingSignal.set(true);
    try {
      const response = await firstValueFrom(this.apiService.createTask(taskData));
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

  async deleteTask(task: Task): Promise<void> {
    this.deletingTaskIdSignal.set(task.id); // 🔥 Inicia loading para esta task
    
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
      this.deletingTaskIdSignal.set(null); // 🔥 Termina loading
    }
  }

  async advanceStatus(task: Task): Promise<void> {
    this.updatingTaskIdSignal.set(task.id); // 🔥 Inicia loading para esta task
    
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
      
      // Atualizar localmente
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
      console.error('Erro ao avançar status:', error);
      throw error;
    } finally {
      this.updatingTaskIdSignal.set(null); // 🔥 Termina loading
    }
  }

  async regressStatus(task: Task): Promise<void> {
    this.updatingTaskIdSignal.set(task.id); // 🔥 Inicia loading para esta task
    
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
      
      // Atualizar localmente
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
      console.error('Erro ao regredir status:', error);
      throw error;
    } finally {
      this.updatingTaskIdSignal.set(null); 
    }
  }

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
      console.error('Erro ao adicionar comentário:', error);
      throw error;
    } finally {
      this.updatingTaskIdSignal.set(null); 
    }
  }

  filterTasks(filters: { search?: string; status?: string }) {
    if (filters.search !== undefined) {
      this.searchQuerySignal.set(filters.search);
    }
    if (filters.status !== undefined) {
      this.statusFilterSignal.set(filters.status);
    }
  }

  getTaskById(id: string): Task | undefined {
    return this.tasksSignal().find(t => t.id === id);
  }
}