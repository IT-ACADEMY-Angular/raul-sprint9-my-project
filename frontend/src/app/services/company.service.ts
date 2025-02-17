import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkerData } from '../models/worker.model';
import { Company } from '../interfaces/company.interface';
import { CreateCompanyPayload } from '../interfaces/create-company-payload.interface';

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

  searchCompanies(query: string): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/search`, { params: { q: query } });
  }
}

export type { Company };
export type { CreateCompanyPayload };