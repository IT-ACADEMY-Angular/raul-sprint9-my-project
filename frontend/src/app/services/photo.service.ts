import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private allowedTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif', 'image/webp'];

  constructor(private http: HttpClient) { }

  isValidFileType(file: File): boolean {
    return this.allowedTypes.includes(file.type);
  }

  uploadPhoto(file: File, uploadUrl: string): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<{ photoUrl: string }>(uploadUrl, formData).pipe(
      map(response => response.photoUrl)
    );
  }

}
