import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom, Observable } from 'rxjs';
import { Company } from '../interfaces/company.interface';
import { CreateCompanyPayload } from '../interfaces/create-company-payload.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private baseUrl: string = environment.apiUrl + '/api/users';

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
    const headers = new HttpHeaders().set('X-Skip-Loading', 'true');
    return this.http.get<Company[]>(`${this.baseUrl}/search`, { params: { q: query }, headers });
  }

  getCompanyByUserId(userId: number): Promise<Company | null> {
    return lastValueFrom(this.http.get<Company>(`${this.baseUrl}/user/${userId}`))
      .catch(error => {
        console.error('Error al obtener empresa por usuario:', error);
        return null;
      });
  }
  deleteCompanyByOwnerId(ownerId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/owner/${ownerId}`);
  }

  getAllCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.baseUrl);
  }

  updateCompany(id: number, payload: CreateCompanyPayload): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/${id}`, payload);
  }
}

export type { Company };
export type { CreateCompanyPayload };