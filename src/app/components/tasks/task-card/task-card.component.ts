import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icon/icon.component';
import { Task, TaskStatus, User, UserRole } from '../../../models/types';
import { STATUS_COLORS, StatusOrder } from '../../../constants';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.css']
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Input() user!: User;
  @Input() users: User[] = [];
  @Input() isDeleting = false;
  @Input() isUpdating = false;
  @Input() onEdit: (() => void) | null = null; // Função callback para editar

  @Output() onAdvance = new EventEmitter<void>();
  @Output() onRegress = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
  @Output() onAddComment = new EventEmitter<string>();

  commentText = '';
  showAllComments = false;
  isLoading = false;

  // Mapeamento de aliases de status
  private statusAliasMap: Record<string, TaskStatus> = {
    'ABERTO': TaskStatus.PENDENTE,
    'ABERTA': TaskStatus.PENDENTE,
    'EM_ANDAMENTO': TaskStatus.EM_PROGRESSO,
    'EM ANDAMENTO': TaskStatus.EM_PROGRESSO,
    'EM_EXECUCAO': TaskStatus.EM_PROGRESSO,
    'EM EXECUCAO': TaskStatus.EM_PROGRESSO,
    'EM_REVISAO': TaskStatus.EM_PROGRESSO,
    'EM REVISAO': TaskStatus.EM_PROGRESSO,
    'REVISAO': TaskStatus.EM_PROGRESSO,
    'CONCLUIDA': TaskStatus.TERMINADO,
    'CONCLUÍDA': TaskStatus.TERMINADO,
    'CONCLUIDO': TaskStatus.TERMINADO,
    'CONCLUÍDO': TaskStatus.TERMINADO,
    'ARQUIVADO': TaskStatus.FECHADO,
    'ARQUIVADA': TaskStatus.FECHADO,
    'CANCELADA': TaskStatus.FECHADO
  };

  get mappedStatus(): TaskStatus {
    if (Object.values(TaskStatus).includes(this.task.status as TaskStatus)) {
      return this.task.status as TaskStatus;
    }
    return this.statusAliasMap[this.task.status] || this.task.status as TaskStatus;
  }

  get currentIndex(): number {
    return StatusOrder.indexOf(this.mappedStatus);
  }

  get isInWorkflow(): boolean {
    return this.currentIndex !== -1;
  }

  get isTerminal(): boolean {
    return this.mappedStatus === TaskStatus.ATRASADA;
  }

  get isFinished(): boolean {
    return this.mappedStatus === TaskStatus.TERMINADO;
  }

  get isClosed(): boolean {
    return this.mappedStatus === TaskStatus.FECHADO || this.isTerminal;
  }

  get nextStatus(): TaskStatus | null {
    return this.isInWorkflow && this.currentIndex < StatusOrder.length - 1 
      ? StatusOrder[this.currentIndex + 1] 
      : null;
  }

  get prevStatus(): TaskStatus | null {
    return this.isInWorkflow && this.currentIndex > 0 
      ? StatusOrder[this.currentIndex - 1] 
      : null;
  }

  get isTaskMember(): boolean {
    return this.task.responsibleId === this.user.id || 
           this.task.intervenientes?.includes(this.user.id) || false;
  }

  get isAdmin(): boolean {
    return this.user.role === UserRole.ADMIN;
  }

  get responsibleUser(): User | undefined {
    return this.users?.find(u => u.id === this.task.responsibleId);
  }

  get respName(): string | undefined {
    return this.responsibleUser?.name;
  }

  get extra(): string {
    return this.task.intervenientes?.length ? ` +${this.task.intervenientes.length}` : '';
  }

  get canAdvance(): boolean {
    return !this.isClosed && this.nextStatus !== null && (this.isAdmin || this.isTaskMember);
  }

  get canRegress(): boolean {
    return !this.isClosed && this.prevStatus !== null && (this.isAdmin || this.isTaskMember);
  }

  get finalCanAdvance(): boolean {
    return this.isFinished ? (this.isAdmin && this.canAdvance) : this.canAdvance;
  }

  get finalCanRegress(): boolean {
    return this.isFinished ? (this.isAdmin && this.canRegress) : this.canRegress;
  }

  get isLoading_(): boolean {
    return this.isLoading || this.isDeleting || this.isUpdating;
  }

  get advanceButtonText(): string {
    if (this.isFinished) return this.isAdmin ? 'Validar' : 'Finalizada';
    if (this.mappedStatus === TaskStatus.PENDENTE) return 'Iniciar';
    if (this.mappedStatus === TaskStatus.EM_PROGRESSO) return 'Concluir';
    if (this.mappedStatus === TaskStatus.TERMINADO) return 'Fechar';
    return 'Avançar';
  }

  get STATUS_COLORS() {
    return STATUS_COLORS;
  }

  get TaskStatus() {
    return TaskStatus;
  }

  async handleAdvance(): Promise<void> {
    if (!this.finalCanAdvance || this.isLoading_) return;
    
    this.isLoading = true;
    try {
      this.onAdvance.emit();
    } catch (error) {
      console.error('Erro ao avançar tarefa:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async handleRegress(): Promise<void> {
    if (!this.finalCanRegress || this.isLoading_) return;
    
    this.isLoading = true;
    try {
      this.onRegress.emit();
    } catch (error) {
      console.error('Erro ao recuar tarefa:', error);
    } finally {
      this.isLoading = false;
    }
  }

  handleDelete(): void {
    this.onDelete.emit();
  }

  handleAddComment(): void {
    if (!this.commentText.trim() || this.isLoading_) return;
    
    this.onAddComment.emit(this.commentText.trim());
    this.commentText = '';
  }

  handleEdit(): void {
    if (this.onEdit) {
      this.onEdit();
    }
  }

  toggleShowAllComments(): void {
    this.showAllComments = !this.showAllComments;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}