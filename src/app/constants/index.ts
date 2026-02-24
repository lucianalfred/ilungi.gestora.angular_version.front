// src/app/constants/index.ts

import { TaskStatus } from "../models/types";

// ============================================
// TRANSLATIONS
// ============================================
export interface Translations {
  // Geral
  appName: string;
  loading: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  
  // Dashboard
  dashboard: string;
  activeTasks: string;
  overdueTasks: string;
  completedTasks: string;
  tasksByStatus: string;
  
  // Reports
  employeeReport: string;
  employee: string;
  total: string;
  completed: string;
  overdue: string;
  complianceRate: string;
  search: string;
  allStatuses: string;
  createTask: string;
  noTasks: string;
  // Tasks
  tasks: string;
  taskTitle: string;
  taskDescription: string;
  taskStatus: string;
  taskPriority: string;
  taskResponsible: string;
  taskParticipants: string;
  taskDueDate: string;
  taskCreatedAt: string;
  taskCompletedAt: string;
  addComment: string;
  comments: string;
  noComments: string;
  
  // Users
  users: string;
  userName: string;
  userEmail: string;
  userRole: string;
  userDepartment: string;
  userPosition: string;
  userPhone: string;
  
  // Profile
  profile: string;
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordMismatch: string;
  passwordChanged: string;
  
  // Reports
  reports: string;
  
  // Landing
  landingTitle: string;
  landingDesc: string;
  
  // Actions
  advance: string;
  regress: string;
  start: string;
  complete: string;
  validate: string;
  deleteConfirm: string;
  
  // Status Labels
  statusPendente: string;
  statusEmProgresso: string;
  statusAtrasada: string;
  statusTerminado: string;
  statusFechado: string;

  
}

export const TRANSLATIONS: Record<string, Translations> = {
  pt: {
    // Geral
    appName: 'GESTORA',
    loading: 'Carregando...',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    search: 'Pesquisar...',
    allStatuses: 'Todos os status',
    createTask: 'Nova Tarefa',
    noTasks: 'Nenhuma tarefa encontrada',
    // Dashboard
    dashboard: 'Dashboard',
    activeTasks: 'Tarefas Ativas',
    overdueTasks: 'Tarefas Atrasadas',
    completedTasks: 'Tarefas Concluídas',
    tasksByStatus: 'Tarefas por Estado',
    
    // Reports
    employeeReport: 'Relatório por Funcionário',
    employee: 'Funcionário',
    total: 'Total',
    completed: 'Concluídas',
    overdue: 'Atrasadas',
    complianceRate: 'Taxa de Cumprimento',
    
    // Tasks
    tasks: 'Tarefas',
    taskTitle: 'Título',
    taskDescription: 'Descrição',
    taskStatus: 'Status',
    taskPriority: 'Prioridade',
    taskResponsible: 'Responsável',
    taskParticipants: 'Participantes',
    taskDueDate: 'Prazo',
    taskCreatedAt: 'Criada em',
    taskCompletedAt: 'Concluída em',
    addComment: 'Adicionar comentário...',
    comments: 'Comentários',
    noComments: 'Sem comentários',
    
    // Users
    users: 'Usuários',
    userName: 'Nome',
    userEmail: 'E-mail',
    userRole: 'Função',
    userDepartment: 'Departamento',
    userPosition: 'Cargo',
    userPhone: 'Telefone',
    
    // Profile
    profile: 'Perfil',
    changePassword: 'Alterar Senha',
    currentPassword: 'Senha Atual',
    newPassword: 'Nova Senha',
    confirmPassword: 'Confirmar Senha',
    passwordMismatch: 'As senhas não coincidem',
    passwordChanged: 'Senha alterada com sucesso!',
    
    // Reports
    reports: 'Relatórios',
    
    // Landing
    landingTitle: 'Gestão de Tarefas simples e eficaz',
    landingDesc: 'Organize suas tarefas de forma simples e eficiente',
    
    // Actions
    advance: 'Avançar',
    regress: 'Recuar',
    start: 'Iniciar',
    complete: 'Concluir',
    validate: 'Validar',
    deleteConfirm: 'Tem certeza que deseja excluir?',
    
    // Status Labels
    statusPendente: 'Pendente',
    statusEmProgresso: 'Em Progresso',
    statusAtrasada: 'Atrasada',
    statusTerminado: 'Terminado',
    statusFechado: 'Fechado'
  },
  en: {
    // Geral
    appName: 'GESTORA',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search...',
    allStatuses: 'All statuses',
    createTask: 'New Task',
    noTasks: 'No tasks found',
    // Dashboard
    dashboard: 'Dashboard',
    activeTasks: 'Active Tasks',
    overdueTasks: 'Overdue Tasks',
    completedTasks: 'Completed Tasks',
    tasksByStatus: 'Tasks by Status',
    
    // Reports
    employeeReport: 'Employee Report',
    employee: 'Employee',
    total: 'Total',
    completed: 'Completed',
    overdue: 'Overdue',
    complianceRate: 'Compliance Rate',
    
    // Tasks
    tasks: 'Tasks',
    taskTitle: 'Title',
    taskDescription: 'Description',
    taskStatus: 'Status',
    taskPriority: 'Priority',
    taskResponsible: 'Responsible',
    taskParticipants: 'Participants',
    taskDueDate: 'Due Date',
    taskCreatedAt: 'Created At',
    taskCompletedAt: 'Completed At',
    addComment: 'Add comment...',
    comments: 'Comments',
    noComments: 'No comments',
    
    // Users
    users: 'Users',
    userName: 'Name',
    userEmail: 'Email',
    userRole: 'Role',
    userDepartment: 'Department',
    userPosition: 'Position',
    userPhone: 'Phone',
    
    // Profile
    profile: 'Profile',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    passwordMismatch: 'Passwords do not match',
    passwordChanged: 'Password changed successfully!',
    
    // Reports
    reports: 'Reports',
    
    // Landing
    landingTitle: 'Simple and effective Task Management',
    landingDesc: 'Organize your tasks simply and efficiently',
    
    // Actions
    advance: 'Advance',
    regress: 'Regress',
    start: 'Start',
    complete: 'Complete',
    validate: 'Validate',
    deleteConfirm: 'Are you sure you want to delete?',
    
    // Status Labels
    statusPendente: 'Pending',
    statusEmProgresso: 'In Progress',
    statusAtrasada: 'Overdue',
    statusTerminado: 'Finished',
    statusFechado: 'Closed'
  }
};

// ============================================
// STATUS CONFIGURATIONS (CORRIGIDO - removido CONCLUIDA)
// ============================================
export const StatusOrder: TaskStatus[] = [
  TaskStatus.PENDENTE,
  TaskStatus.EM_PROGRESSO,
  TaskStatus.ATRASADA,
  TaskStatus.TERMINADO,
  TaskStatus.FECHADO
];

export interface StatusColorConfig {
  bg: string;
  text: string;
  badge: string;
}

export const STATUS_COLORS: Record<TaskStatus, StatusColorConfig> = {
  [TaskStatus.PENDENTE]: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500'
  },
  [TaskStatus.EM_PROGRESSO]: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500'
  },
  [TaskStatus.ATRASADA]: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    text: 'text-rose-700 dark:text-rose-400',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-500'
  },
  [TaskStatus.TERMINADO]: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500'
  },
  [TaskStatus.FECHADO]: {
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-500 dark:text-slate-400',
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  }
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.PENDENTE]: 'Pendente',
  [TaskStatus.EM_PROGRESSO]: 'Em Progresso',
  [TaskStatus.ATRASADA]: 'Atrasada',
  [TaskStatus.TERMINADO]: 'Terminado',
  [TaskStatus.FECHADO]: 'Fechado'
};