import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Observable } from 'rxjs';
import { User } from './auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private api: ApiService) {}

  // Obtener todos los usuarios excepto el actual
  getAllUsers(): Observable<User[]> {
    return this.api.get<User[]>('/auth');
  }

  // Obtener usuario por ID
  getUserById(id: number): Observable<User> {
    return this.api.get<User>(`/auth/${id}`);
  }

  // Obtener usuario por username
  getUserByUsername(username: string): Observable<User> {
    return this.api.get<User>(`/auth/username/${username}`);
  }

  // Actualizar usuario
  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.api.patch<User>(`/auth/${id}`, userData);
  }

  // Eliminar usuario
  deleteUser(id: number): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`/auth/${id}`);
  }
}