import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'gestora_token';
  private token: string | null = null;

  constructor(private http: HttpClient) {
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage(): void {
    const storedToken = localStorage.getItem(this.tokenKey);
    if (storedToken) {
      this.token = storedToken;
    }
  }

  setToken(token: string, remember: boolean = true): void {
    this.token = token;
    if (remember) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      sessionStorage.setItem(this.tokenKey, token);
    }
  }

  removeToken(): void {
    this.token = null;
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    if (this.token) return this.token;
    
    const stored = localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
    if (stored) {
      this.token = stored;
    }
    return this.token;
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const token = this.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // AUTENTICAÇÃO
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers: this.getHeaders() });
  }

  register(email: string, name: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, { email, name, password });
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me`, { headers: this.getHeaders() });
  }

  validateSetupToken(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/validate-setup-token`, { token });
  }

  setupPassword(token: string, password: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/setup-password`, { token, password, confirmPassword });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/validate-reset-token`, { token });
  }

  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, newPassword, confirmPassword });
  }

  // TAREFAS (Usuário comum)
  getMyTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/my-tasks`, { headers: this.getHeaders() });
  }

  getTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks`, { headers: this.getHeaders() });
  }

  getTaskById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/${id}`, { headers: this.getHeaders() });
  }

  createTask(taskData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/tasks`, taskData, { headers: this.getHeaders() });
  }

  updateTask(id: string, taskData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/tasks/${id}`, taskData, { headers: this.getHeaders() });
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tasks/${id}`, { headers: this.getHeaders() });
  }

  updateTaskStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/tasks/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  // COMENTÁRIOS
  createComment(taskId: string, text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks/${taskId}/comments`, { text }, { headers: this.getHeaders() });
  }

  // NOTIFICAÇÕES
  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
  }

  getUnreadNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications/unread`, { headers: this.getHeaders() });
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications/count`, { headers: this.getHeaders() });
  }

  markNotificationAsRead(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/${id}/read`, {}, { headers: this.getHeaders() });
  }

  markAllNotificationsAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/read-all`, {}, { headers: this.getHeaders() });
  }

  // USUÁRIOS
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { headers: this.getHeaders() });
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() });
  }

  // ADMIN - USUÁRIOS
  getAdminUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users`, { headers: this.getHeaders() });
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/users`, userData, { headers: this.getHeaders() });
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${id}`, userData, { headers: this.getHeaders() });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/users/${id}`, { headers: this.getHeaders() });
  }

  changeUserRole(id: string, role: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/users/${id}/role`, { role }, { headers: this.getHeaders() });
  }

  getUsersByRole(role: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users/by-role/${role}`, { headers: this.getHeaders() });
  }

  // ADMIN - TAREFAS
  getAllTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/tasks`, { headers: this.getHeaders() });
  }

  getTasksByUser(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/tasks/user/${userId}`, { headers: this.getHeaders() });
  }

  assignTaskToUser(taskId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/tasks/${taskId}/assign/${userId}`, {}, { headers: this.getHeaders() });
  }

  removeUserFromTask(taskId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/tasks/${taskId}/assign/${userId}`, { headers: this.getHeaders() });
  }

  assignMultipleUsersToTask(taskId: string, userIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/tasks/${taskId}/assign-multiple`, userIds, { headers: this.getHeaders() });
  }

  createTaskWithResponsibles(taskData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/tasks`, taskData, { headers: this.getHeaders() });
  }

  // ADMIN - ESTATÍSTICAS
  getSystemStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/stats`, { headers: this.getHeaders() });
  }

  getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/dashboard`, { headers: this.getHeaders() });
  }

  // CHANGE PASSWORD
  changePassword(id: string, newPassword: string, oldPassword?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, { id, newPassword, oldPassword }, { headers: this.getHeaders() });
  }
}