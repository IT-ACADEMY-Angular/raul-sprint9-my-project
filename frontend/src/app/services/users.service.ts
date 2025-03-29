import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { UpdateUserDto } from '../interfaces/update-user-dto';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private baseUrl: string = '/users';

  constructor(private http: HttpClient) { }

  updateProfile(payload: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/profile`, payload);
  }

  deleteAccount(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  updatePhoto(id: number, photoUrl: string): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}/photo`, { photoUrl });
  }
}
