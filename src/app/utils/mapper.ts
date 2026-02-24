import { User, UserRole, Task, TaskStatus, Comment } from '../models/types';

export const mapUserFromAPI = (apiUser: any): User => {
  return {
    id: String(apiUser.id || apiUser.userId || ''),
    email: apiUser.email || '',
    name: apiUser.name || apiUser.username || 'Utilizador',
    phone: apiUser.phone || null,
    role: apiUser.role === 'ADMIN' ? UserRole.ADMIN : UserRole.USER,
    position: apiUser.position || apiUser.role || '',
    department: apiUser.department || '',
    avatar: apiUser.avatar || null,
    mustChangePassword: apiUser.mustChangePassword ?? false,
    createdAt: apiUser.createdAt || new Date().toISOString(),
    updatedAt: apiUser.updatedAt || new Date().toISOString(),
  };
};

export const mapTaskFromAPI = (apiTask: any): Task => {
  return {
    id: String(apiTask.id || ''),
    title: apiTask.title || '',
    description: apiTask.description || '',
    status: apiTask.status || 'PENDENTE',
    priority: apiTask.priority || 'MEDIA',
    responsibleId: String(apiTask.responsibleId || (apiTask.responsibles && apiTask.responsibles[0]?.id) || ''),
    responsibleName: apiTask.responsibleName || (apiTask.responsibles && apiTask.responsibles[0]?.name) || '',
    deliveryDate: apiTask.endDate || apiTask.deliveryDate || new Date().toISOString(),
    startDate: apiTask.createAt || apiTask.startDate || new Date().toISOString(),
    intervenientes: Array.isArray(apiTask.responsibles) 
      ? apiTask.responsibles.slice(1).map((r: any) => String(r.id))
      : (apiTask.intervenientes || []),
    comments: Array.isArray(apiTask.comments) ? apiTask.comments.map(mapCommentFromAPI) : [],
    createdAt: apiTask.createdAt || apiTask.createAt || new Date().toISOString(),
    updatedAt: apiTask.updatedAt || new Date().toISOString(),
    deadlineValue: apiTask.daysToFinish || 1,
    deadlineType: 'days',
    createdById: String(apiTask.createdById || ''),
    createdByName: apiTask.createdByName || '',
    daysToFinish: apiTask.daysToFinish || 1
  };
};

export const mapCommentFromAPI = (apiComment: any): Comment => {
  return {
    id: String(apiComment.id || ''),
    text: apiComment.text || apiComment.content || '',
    userId: String(apiComment.userId || apiComment.user?.id || apiComment.authorId || ''),
    userName: apiComment.userName || apiComment.user?.name || apiComment.authorName || 'Anônimo',
    timestamp: apiComment.timestamp || apiComment.createdAt || new Date().toISOString(),
    taskId: String(apiComment.taskId || apiComment.task?.id || ''),
    createdAt: apiComment.createdAt || new Date().toISOString()
  };
};