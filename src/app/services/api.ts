import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from './token';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private refreshTokenInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.tokenService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${url}`, { headers: this.getHeaders() }) as Observable<T>;
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${url}`, body, { headers: this.getHeaders() }) as Observable<T>;
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${url}`, body, { headers: this.getHeaders() }) as Observable<T>;
  }

  patch<T>(url: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${url}`, body, { headers: this.getHeaders() }) as Observable<T>;
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${url}`, { headers: this.getHeaders() }) as Observable<T>;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      return this.handle401Error(error);
    }
    return throwError(() => error);
  }

  private handle401Error(error: HttpErrorResponse) {
    if (!this.refreshTokenInProgress) {
      this.refreshTokenInProgress = true;
      this.refreshTokenSubject.next(null);

      return this.post('/auth/refresh-token', {}).pipe(
        switchMap((response: any) => {
          this.refreshTokenInProgress = false;
          this.tokenService.setTokens(response.access_token, response.refresh_token);
          this.refreshTokenSubject.next(response.access_token);
          
          const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${response.access_token}`
          });
          return this.http.request(error.error.method, error.error.url, { headers });
        }),
        catchError(() => {
          this.refreshTokenInProgress = false;
          this.tokenService.clearTokens();
          this.router.navigate(['/login']);
          return throwError(() => error);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        switchMap(token => {
          if (token) {
            const headers = new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            });
            return this.http.request(error.error.method, error.error.url, { headers });
          }
          return throwError(() => error);
        })
      );
    }
  }
}