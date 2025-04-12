import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, switchMap } from 'rxjs';
import { ModalConfirmDialogComponent } from '../modal-confirm-dialog/modal-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogData } from '../../interfaces/confirm-dialog-data.interface';
import { PhotoService } from '../../services/photo.service';
import { PhotoCropModalComponent } from '../photo-crop-modal/photo-crop-modal.component';
import { UsersService } from '../../services/users.service';
import { ToastrService } from 'ngx-toastr';
import { UpdateUserDto } from '../../interfaces/update-user-dto';
import { environment } from '../../../environments/environment';

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

  submitted: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private dialog: MatDialog,
    private photoService: PhotoService,
    private usersService: UsersService,
    private toastr: ToastrService
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

  openCropModal(): void {
    const dialogRef = this.dialog.open(PhotoCropModalComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const file = this.base64ToFile(result, 'cropped-image.png');
        this.selectedFile = file;
        this.previewPhotoUrl = result;
      }
    });
  }

  private base64ToFile(data: string, filename: string): File {
    const arr = data.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  uploadPhoto(file: File): Observable<string> {
    if (!this.user) {
      throw new Error('User not defined');
    }
    const uploadUrl = `${environment.apiUrl}/api/users/${this.user.id}/photo`;
    return this.photoService.uploadPhoto(file, uploadUrl);
  }

  guardarCambios(form: NgForm): void {
    this.submitted = true;

    if (!form.valid) {
      return;
    }

    if (this.newPassword || this.confirmPassword) {
      if (this.newPassword !== this.confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
      }
    }

    const updateProfile$ = () => {
      const payload: UpdateUserDto = {
        id: this.user!.id,
        name: this.nombre,
        lastName: this.apellidos,
        email: this.mail,
        phone: this.telefono,
        password: this.newPassword ? this.newPassword : undefined
      };
      return this.usersService.updateProfile(payload).pipe(
        tap((updatedUser: User) => {
          this.authService.updateCurrentUser(updatedUser);
        })
      );
    };

    if (this.selectedFile && this.user) {
      this.uploadPhoto(this.selectedFile).pipe(
        switchMap(() => updateProfile$())
      ).subscribe(
        () => {
          this.toastr.success(
            'Guardado correctamente',
            '',
            {
              timeOut: 5000,
              positionClass: 'toast-bottom-full-width',
              progressBar: true,
              progressAnimation: 'increasing'
            }
          );
          this.router.navigate(['/profile']);
        },
        (error) => {
          console.error('Error al guardar cambios:', error);
        }
      );
    } else {
      updateProfile$().subscribe(
        () => {
          this.toastr.success(
            'Guardado correctamente',
            '',
            {
              timeOut: 5000,
              positionClass: 'toast-bottom-full-width',
              progressBar: true,
              progressAnimation: 'increasing'
            }
          );
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

  onImageError(event: Event): void {
    if (this.user) {
      this.user.photoUrl = undefined;
    }
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
