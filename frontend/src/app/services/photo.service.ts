import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

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
    return from(this.optimizeImage(file)).pipe(
      switchMap(optimizedFile =>
        from(this.computeHash(optimizedFile)).pipe(
          switchMap(hash => {
            const formData = new FormData();
            formData.append('file', optimizedFile);
            formData.append('hash', hash);
            return this.http.put<{ photoUrl: string }>(uploadUrl, formData).pipe(
              map(response => response.photoUrl)
            );
          })
        )
      )
    );
  }

  private optimizeImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = event => {
        img.src = event.target?.result as string;
      };
      img.onload = () => {
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        const canvas = document.createElement('canvas');
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('No se pudo obtener el contexto del canvas.'));
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (blob) {
            const newFile = new File([blob], file.name, { type: file.type });
            resolve(newFile);
          } else {
            reject(new Error('Error optimizando la imagen.'));
          }
        }, file.type, 0.7);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  private async computeHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
}
