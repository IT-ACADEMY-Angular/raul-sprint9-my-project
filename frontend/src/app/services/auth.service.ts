import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginResponse, RegisterPayload } from '../interfaces/auth.interfaces';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl: string = '/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { email, password });
  }

  register(payload: RegisterPayload): Observable<Omit<User, 'password'>> {
    return this.http.post<Omit<User, 'password'>>(`${this.baseUrl}/register`, payload);
  }
}
