import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginResponse, RegisterPayload } from '../interfaces/auth.interfaces';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl: string = '/auth';

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      })
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  register(payload: RegisterPayload): Observable<Omit<User, 'password'>> {
    return this.http.post<Omit<User, 'password'>>(`${this.baseUrl}/register`, payload);
  }

  updateProfile(payload: { name: string; lastName: string; email: string; phone: string }): Observable<User> {
    return this.http.put<User>('/users/profile', payload).pipe(
      tap(updatedUser => {
        this.currentUserSubject.next(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      })
    );
  }
}
