import { Injectable } from '@angular/core';
import { ApiService } from '../../../services/api';
import { Observable } from 'rxjs';
import { Task } from '../../../types/task';
import { TokenService } from '../../../services/token';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  constructor(
    private api: ApiService,
    private tokenService: TokenService
  ) {}

  // GET /api/tasks - Obtener todas las tareas del usuario autenticado
  getMyTasks(): Observable<Task[]> {
    return this.api.get<Task[]>('/tasks');
  }

  // GET /api/tasks/:id - Obtener una tarea por ID
  getTask(id: number): Observable<Task> {
    return this.api.get<Task>(`/tasks/${id}`);
  }

  // POST /api/tasks - Crear nueva tarea (incluye user_id automáticamente)
  createTask(task: Partial<Task>): Observable<Task> {
    const user = this.tokenService.getUser();
    const taskData = {
      name: task.name,
      description: task.description || '',
      priority: task.priority === true,
      user_id: user?.id
    };
    return this.api.post<Task>('/tasks', taskData);
  }

  // PUT /api/tasks/:id - Actualizar tarea
  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.api.put<Task>(`/tasks/${id}`, task);
  }

  // DELETE /api/tasks/:id - Eliminar tarea
  deleteTask(id: number): Observable<void> {
    return this.api.delete<void>(`/tasks/${id}`);
  }
}