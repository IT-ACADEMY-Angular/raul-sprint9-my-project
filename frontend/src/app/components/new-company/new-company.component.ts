import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkerListComponent } from '../worker-list/worker-list.component';
import { Router } from '@angular/router';
import { CompanyService, CreateCompanyPayload, Company } from '../../services/company.service';
import { WorkerData } from '../../models/worker.model';
import { map, Observable, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'new-company-component',
  imports: [FormsModule, CommonModule, WorkerListComponent],
  templateUrl: './new-company.component.html',
  styleUrl: './new-company.component.css'
})
export class NewCompanyComponent {
  breadcrumb: string = 'Registrar empresa';
  companyName: string = '';
  companyPhotoUrl: string = '';
  previewPhotoUrl: string | null = null;
  selectedFile: File | null = null;

  workerData: WorkerData[] = [];
  newWorkerName: string = '';

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private router: Router,
    private companyService: CompanyService,
    private authService: AuthService
  ) { }

  goBack(): void {
    this.router.navigate(['/']);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Formato de imagen no permitido. Por favor sube un JPG, PNG, BMP, GIF o WEBP.');
        return;
      }
      this.selectedFile = file;
      this.previewPhotoUrl = URL.createObjectURL(file);
    }
  }

  onImageError(event: Event): void {
    this.companyPhotoUrl = '';
  }

  uploadPhoto(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `http://localhost:3000/companies/photo`;
    return this.companyService.uploadCompanyPhoto(url, formData).pipe(
      map((response: { photoUrl: string }) => response.photoUrl)
    );
  }

  addWorker(): void {
    if (this.newWorkerName.trim() !== '') {
      this.workerData.push({ name: this.newWorkerName.trim(), tasks: [] });
      this.newWorkerName = '';
    }
  }

  updateWorkers(workers: WorkerData[]): void {
    this.workerData = workers;
  }

  registrarEmpresa(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Debes estar logueado para registrar una empresa.');
      return;
    }
    const ownerId = currentUser.id;

    const register$ = () => {
      const payload: CreateCompanyPayload = {
        ownerId,
        name: this.companyName,
        photoUrl: this.companyPhotoUrl || '',
        workerData: this.workerData,
      };
      return this.companyService.createCompany(payload);
    };

    if (this.selectedFile) {
      this.uploadPhoto(this.selectedFile).pipe(
        switchMap((photoUrl: string) => {
          this.companyPhotoUrl = photoUrl;
          return register$();
        })
      ).subscribe(
        (company: Company) => {
          console.log('Empresa creada correctamente:', company);
          this.router.navigate(['/profile']);
        },
        (error) => {
          console.error('Error al crear la empresa:', error);
        }
      );
    } else {
      register$().subscribe(
        (company: Company) => {
          console.log('Empresa creada correctamente:', company);
          this.router.navigate(['/profile']);
        },
        (error) => {
          console.error('Error al crear la empresa:', error);
        }
      );
    }
  }
}