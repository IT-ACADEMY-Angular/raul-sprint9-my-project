import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../interfaces/auth.interfaces';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, switchMap } from 'rxjs';

@Component({
  selector: 'edit-profile-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent {
  breadcrumb: string = 'Editar perfil';
  nombre: string = '';
  apellidos: string = '';
  mail: string = '';
  telefono: string = '';
  user: User | null = null;

  selectedFile: File | null = null;
  previewPhotoUrl: string | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.user = user;
        this.nombre = user.name;
        this.apellidos = user.lastName;
        this.mail = user.email;
        this.telefono = user.phone;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Formato de imagen no permitido. Por favor sube un JPG, PNG o BMP.');
        return;
      }
      this.selectedFile = file;
      this.previewPhotoUrl = URL.createObjectURL(this.selectedFile);
    }
  }

  onImageError(event: Event): void {
    this.user!.photoUrl = undefined;
  }

  uploadPhoto(file: File): Observable<User> {
    if (!this.user) {
      throw new Error('User not defined');
    }
    const formData = new FormData();
    formData.append('file', file);
    const url = `http://localhost:3000/users/${this.user.id}/photo`;
    return this.http.put<User>(url, formData).pipe(
      tap((response: User) => {
        console.log('Foto subida:', response);
        if (response.photoUrl) {
          this.user!.photoUrl = response.photoUrl;
          this.authService.updateCurrentUser(this.user!);
        }
      })
    );
  }

  guardarCambios(): void {
    const updateProfile$ = () => {
      const payload = {
        name: this.nombre,
        lastName: this.apellidos,
        email: this.mail,
        phone: this.telefono,
      };
      return this.authService.updateProfile(payload).pipe(
        tap((updatedUser: User) => {
          console.log('Cambios guardados:', updatedUser);
        })
      );
    };

    if (this.selectedFile && this.user) {
      this.uploadPhoto(this.selectedFile).pipe(
        switchMap(() => updateProfile$())
      ).subscribe(
        () => {
          this.router.navigate(['/profile']);
        },
        (error) => {
          console.error('Error al guardar cambios:', error);
        }
      );
    } else {
      updateProfile$().subscribe(
        () => {
          this.router.navigate(['/profile']);
        },
        (error) => {
          console.error('Error al guardar cambios:', error);
        }
      );
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
}
