import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
  id: number;
  name: string;
  photoUrl?: string;
}

export interface CreateCompanyPayload {
  ownerId: number;
  name: string;
  photoUrl?: string;
  workerData?: { name: string; tasks?: { name: string; duration: number }[] }[];
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private baseUrl = '/companies';

  constructor(private http: HttpClient) { }

  createCompany(payload: CreateCompanyPayload): Observable<Company> {
    return this.http.post<Company>(this.baseUrl, payload);
  }

  uploadCompanyPhoto(url: string, formData: FormData): Observable<{ photoUrl: string }> {
    return this.http.put<{ photoUrl: string }>(url, formData);
  }

  getCompany(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/${id}`);
  }
}