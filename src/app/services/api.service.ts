import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../enviroments/enviroment';

export interface LoginResponse {
  token?: string;
  jwt?: string;
  user?: any;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
  position?: string;
  department?: string;
  mustChangePassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  status: string;
  priority?: string;
  responsibleId: string;
  intervenientes?: string[];
  startDate: string;
  deliveryDate: string;
  comments?: any[];
  createdById: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  daysToFinish?: number;
  deadlineValue?: number;
  deadlineType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiBase = environment.apiUrl;
  private tokenKey = 'gestora_api_token';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }

  setToken(token: string, remember: boolean = false): void {
    if (remember) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      sessionStorage.setItem(this.tokenKey, token);
    }
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    let errorMessage = 'Erro desconhecido';
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = error.error.message;
    } else {
      // Erro do servidor
      errorMessage = error.error?.message || error.message || `Erro ${error.status}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // =================== AUTH ENDPOINTS ===================

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiBase}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          const token = response.token || response.jwt;
          if (token) {
            this.setToken(token);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<any> {
    this.removeToken();
    return this.http.post(`${this.apiBase}/auth/logout`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiBase}/auth/me`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  register(email: string, name: string, password: string, phone?: string): Observable<any> {
    return this.http.post(`${this.apiBase}/auth/register`, { email, name, password, phone })
      .pipe(catchError(this.handleError));
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiBase}/auth/forgot-password`, { email })
      .pipe(catchError(this.handleError));
  }

  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiBase}/auth/reset-password`, { token, newPassword, confirmPassword })
      .pipe(catchError(this.handleError));
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${this.apiBase}/auth/validate-reset-token/${token}`)
      .pipe(catchError(this.handleError));
  }

  validateSetupToken(token: string): Observable<any> {
    return this.http.get(`${this.apiBase}/auth/validate-setup-token/${token}`)
      .pipe(catchError(this.handleError));
  }

  setupPassword(token: string, password: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiBase}/auth/setup-password`, { token, password, confirmPassword })
      .pipe(catchError(this.handleError));
  }

  // =================== TASKS ENDPOINTS ===================

  getMyTasks(): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.apiBase}/tasks/my-tasks`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAllTasks(): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.apiBase}/admin/tasks`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getTaskById(id: string): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.apiBase}/tasks/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createTask(taskData: any): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`${this.apiBase}/admin/tasks`, taskData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateTask(id: string, taskData: any): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.apiBase}/tasks/${id}`, taskData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.apiBase}/tasks/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateTaskStatus(id: string, status: string): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.apiBase}/tasks/${id}/status`, { status }, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getTaskStats(): Observable<any> {
    return this.http.get(`${this.apiBase}/tasks/my-stats`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // =================== USERS ENDPOINTS ===================

  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiBase}/admin/users`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAdminUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiBase}/admin/users`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getUserById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiBase}/users/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createUser(userData: any): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiBase}/admin/users`, userData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateUser(id: string, userData: any): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiBase}/admin/users/${id}`, userData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiBase}/admin/users/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  changeUserRole(id: string, role: string): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiBase}/admin/users/${id}/role?role=${encodeURIComponent(role)}`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateProfile(id: string, data: any): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiBase}/users/${id}/profile`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  changePassword(id: string, password: string, oldPassword?: string): Observable<any> {
    return this.http.patch(`${this.apiBase}/users/${id}/password`, { password, oldPassword }, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // =================== COMMENTS ENDPOINTS ===================

  createComment(taskId: string, text: string): Observable<any> {
    return this.http.post(`${this.apiBase}/tasks/${taskId}/comments`, { text }, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getTaskComments(taskId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/tasks/${taskId}/comments`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // =================== DASHBOARD ENDPOINTS ===================

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiBase}/admin/stats`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiBase}/admin/dashboard`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  

// ============================================
// NOTIFICAÇÕES
// ============================================

  getNotifications() {
  return this.http.get(`${this.apiBase}/notifications`, {
      headers: this.getHeaders()
    });
  }

  getUnreadNotifications() {
    return this.http.get(`${this.apiBase}/notifications/unread`, {
      headers: this.getHeaders()
    });
  }

  getUnreadCount() {
    return this.http.get(`${this.apiBase}/notifications/count`, {
      headers: this.getHeaders()
    });
  }

  markNotificationAsRead(id: string) {
    return this.http.patch(`${this.apiBase}/notifications/${id}/read`, {}, {
      headers: this.getHeaders()
    });
  }

    markAllNotificationsAsRead() {
      return this.http.patch(`${this.apiBase}/notifications/read-all`, {}, {
      headers: this.getHeaders()
      });
    }

  // =================== HEALTH CHECK ===================

  ping(): Observable<any> {
    return this.http.get(`${this.apiBase}/actuator/health`)
      .pipe(catchError(this.handleError));
  }
}