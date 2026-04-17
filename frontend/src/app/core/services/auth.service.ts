import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, User } from '../../shared/models/user.model';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<User | null>(this.loadUser());
  readonly currentUser = this._currentUser.asReadonly();

  constructor(private readonly api: ApiService) {}

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  findUser(email: string): Observable<AuthResponse> {
    return this.api.get<AuthResponse>('/users', { email }).pipe(
      tap((res) => this.saveSession(res)),
    );
  }

  createUser(email: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/users', { email }).pipe(
      tap((res) => this.saveSession(res)),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._currentUser.set(res.user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
