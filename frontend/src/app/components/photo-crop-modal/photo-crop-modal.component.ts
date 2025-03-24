import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';


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

  constructor(public dialogRef: MatDialogRef<PhotoCropModalComponent>) { }

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
