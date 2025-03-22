import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../interfaces/auth.interfaces';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, switchMap } from 'rxjs';
import { ModalConfirmDialogComponent } from '../modal-confirm-dialog/modal-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogData } from '../../interfaces/confirm-dialog-data.interface';

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
  newPassword: string = '';
  confirmPassword: string = '';
  user: User | null = null;
  originalUser: User | null = null;

  selectedFile: File | null = null;
  previewPhotoUrl: string | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.user = user;
        this.originalUser = { ...user };
        this.nombre = user.name;
        this.apellidos = user.lastName;
        this.mail = user.email;
        this.telefono = user.phone;
      }
    });
  }

  goBack(): void {
    if (this.isFormModified) {
      const confirmData: ConfirmDialogData = {
        title: 'Salir sin guardar',
        message: 'No se van a guardar los cambios. ¿Desea salir?'
      };
      const dialogRef = this.dialog.open(ModalConfirmDialogComponent, {
        width: '300px',
        data: confirmData
      });
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result === true) {
          this.router.navigate(['/profile']);
        }
      });
    } else {
      this.router.navigate(['/profile']);
    }
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
      this.previewPhotoUrl = URL.createObjectURL(file);
    }
  }

  onImageError(event: Event): void {
    if (this.user) {
      this.user.photoUrl = undefined;
    }
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
        if (response.photoUrl) {
          this.user!.photoUrl = response.photoUrl;
          this.authService.updateCurrentUser(this.user!);
        }
      })
    );
  }

  guardarCambios(): void {
    if (this.newPassword || this.confirmPassword) {
      if (this.newPassword !== this.confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
      }
    }

    const updateProfile$ = () => {
      const payload = {
        name: this.nombre,
        lastName: this.apellidos,
        email: this.mail,
        phone: this.telefono,
        password: this.newPassword ? this.newPassword : undefined
      };
      return this.authService.updateProfile(payload).pipe(
        tap((updatedUser: User) => {
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

  get isFormModified(): boolean {
    if (!this.originalUser) {
      return false;
    }
    return (
      this.nombre !== this.originalUser.name ||
      this.apellidos !== this.originalUser.lastName ||
      this.mail !== this.originalUser.email ||
      this.telefono !== this.originalUser.phone ||
      !!this.selectedFile ||
      this.newPassword.trim() !== '' ||
      this.confirmPassword.trim() !== ''
    );
  }
}
