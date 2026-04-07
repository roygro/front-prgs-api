import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { TokenService } from './token';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  lastname: string;
  username: string;
  created_at: string;
  rol_id: number | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private api: ApiService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.loadUser();
  }

  private loadUser(): void {
    if (this.tokenService.isAuthenticated()) {
      this.getProfile().subscribe({
        next: (user) => {
          this.userSubject.next(user);
          this.tokenService.setUser(user);
        },
        error: () => this.logout()
      });
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', { username, password }).pipe(
      tap((response) => {
        this.tokenService.setTokens(response.accessToken, response.refreshToken);
        this.tokenService.setUser(response.user);
        this.userSubject.next(response.user);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  register(data: { name: string; lastname: string; username: string; password: string }): Observable<User> {
    return this.api.post<User>('/auth', data);
  }

  logout(): void {
    this.api.post('/auth/logout', {}).subscribe({
      next: () => {
        this.tokenService.clearTokens();
        this.userSubject.next(null);
        this.router.navigate(['/login']);
      },
      error: () => {
        this.tokenService.clearTokens();
        this.userSubject.next(null);
        this.router.navigate(['/login']);
      }
    });
  }

  getProfile(): Observable<User> {
    return this.api.get<User>('/auth/me');
  }

  isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated();
  }

  getUser(): User | null {
    return this.userSubject.value;
  }
}