import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'photo-crop-modal-component',
  standalone: true,

  imports: [MatDialogModule, ImageCropperComponent, CommonModule],
  templateUrl: './photo-crop-modal.component.html',
  styleUrls: ['./photo-crop-modal.component.css']
})
export class PhotoCropModalComponent {
  imageChangedEvent: any = '';
  croppedImage: string = '';

  selectedFile: File | null = null;
  previewPhotoUrl: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<PhotoCropModalComponent>,
    private toastr: ToastrService
  ) { }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.toastr.error(
          'Formato de imagen no permitido. Por favor sube un JPG, PNG, BMP, GIF o WEBP.',
          'Error',
          {
            timeOut: 5000,
            positionClass: 'toast-bottom-full-width',
            progressBar: true,
            progressAnimation: 'increasing'
          }
        );
        return;
      }
      this.selectedFile = file;
      this.previewPhotoUrl = URL.createObjectURL(file);
      this.fileChangeEvent(event);
    }
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent): void {
    if (event.base64) {
      this.croppedImage = event.base64;
    } else if (event.blob) {
      const reader = new FileReader();
      reader.readAsDataURL(event.blob);
      reader.onload = () => {
        this.croppedImage = reader.result as string;
      };
      reader.onerror = (error) => {
      };
    }
  }

  onConfirm(): void {
    this.dialogRef.close(this.croppedImage);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
