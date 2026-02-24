// ============================================
// USER TYPES
// ============================================

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MANAGER = 'MANAGER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  position?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  mustChangePassword?: boolean;
}

// ============================================
// TASK STATUS ENUM (CORRIGIDO - removido CONCLUIDA)
// ============================================

export enum TaskStatus {
  PENDENTE = 'PENDENTE',
  EM_PROGRESSO = 'EM_PROGRESSO', 
  ATRASADA = 'ATRASADA',
  TERMINADO = 'TERMINADO',
  FECHADO = 'FECHADO'
  // CONCLUIDA removido - use TERMINADO
}

// Mapa de compatibilidade para versões antigas
export const TaskStatusAliases: Record<string, TaskStatus> = {
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
  'CANCELADA': TaskStatus.FECHADO,
  'ABERTO': TaskStatus.PENDENTE,
  'ABERTA': TaskStatus.PENDENTE
};

// ============================================
// TASK PRIORITY ENUM
// ============================================

export enum TaskPriority {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE'
}

// ============================================
// COMMENT TYPES
// ============================================

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  taskId: string;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// TASK TYPES (CORRIGIDO - adicionado dueDate)
// ============================================

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus | string;
  priority?: TaskPriority;
  
  // Datas
  startDate: string;
  deliveryDate: string;
  dueDate?: string; // ADICIONADO - era o campo faltando
  completedAt?: string;
  
  // Responsáveis
  responsibleId: string;
  responsibleName?: string;
  intervenientes?: string[];
  
  // Métricas de prazo
  deadlineValue?: number;
  deadlineType?: 'days' | 'hours';
  daysToFinish?: number;
  
  // Comentários
  comments?: Comment[];
  
  // Metadados
  createdById: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  
  // Campos opcionais
  isOverdue?: boolean;
  progress?: number;
  tags?: string[];
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  read: boolean;
  userId: string;
  taskId?: string;
  timestamp: string;
  createdAt?: string;
}

// ============================================
// ACTIVITY TYPES (CORRIGIDO - adicionados campos faltantes)
// ============================================

export interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'status_changed' | 'comment_added' | 'user_added' | 'user_updated' | 'user_deleted';
  userId: string;
  userName: string;
  taskId?: string;
  taskTitle?: string;
  fromStatus?: string; // ADICIONADO
  toStatus?: string;   // ADICIONADO
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// ============================================
// NAVIGATION TYPES
// ============================================
export type TabType = 'dashboard' | 'tasks' | 'users' | 'profile' | 'reports';
export type ViewType = 'landing' | 'login' | 'app' | 'set-password' | 'reset-password';