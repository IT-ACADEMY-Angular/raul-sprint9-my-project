import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkerListComponent } from '../worker-list/worker-list.component';
import { Router } from '@angular/router';
import { CompanyService, CreateCompanyPayload, Company } from '../../services/company.service';
import { WorkerData } from '../../models/worker.model';
import { map, Observable, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { EditWorkerModalComponent } from '../edit-worker-modal/edit-worker-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalConfirmDialogComponent } from '../modal-confirm-dialog/modal-confirm-dialog.component';
import { ConfirmDialogData } from '../../interfaces/confirm-dialog-data.interface';

@Component({
  selector: 'new-company-component',
  imports: [FormsModule, CommonModule, WorkerListComponent, EditWorkerModalComponent],
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

  showEditWorkerModal: boolean = false;
  workerToEdit!: WorkerData;
  workerToEditIndex: number = -1;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private router: Router,
    private companyService: CompanyService,
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  goBack(): void {
    if (this.isFormModified()) {
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
          this.router.navigate(['/']);
        }
      });
    } else {
      this.router.navigate(['/']);
    }
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

  editWorker(event: { worker: WorkerData; index: number }): void {
    this.workerToEdit = { ...event.worker };
    this.workerToEditIndex = event.index;
    this.showEditWorkerModal = true;
  }

  onWorkerModalClose(updatedWorker: WorkerData): void {
    if (this.workerToEditIndex > -1) {
      this.workerData[this.workerToEditIndex] = updatedWorker;
    }
    this.showEditWorkerModal = false;
  }

  onWorkerModalCancel(): void {
    this.showEditWorkerModal = false;
  }

  isFormModified(): boolean {
    const hasName = this.companyName.trim().length > 0;
    const hasPhoto = !!this.selectedFile || !!this.companyPhotoUrl;
    const hasWorkers = this.workerData.length > 0;
    const atLeastOneWorkerHasTask = this.workerData.some(worker => worker.tasks && worker.tasks.length > 0);
    return hasName || hasPhoto || hasWorkers || atLeastOneWorkerHasTask;
  }

  get isFormComplete(): boolean {
    const hasName = this.companyName.trim().length > 0;
    const hasPhoto = !!this.selectedFile || !!this.companyPhotoUrl;
    const hasWorkers = this.workerData.length > 0;
    const atLeastOneWorkerHasTask = this.workerData.some(worker => worker.tasks && worker.tasks.length > 0);
    return hasName && hasPhoto && hasWorkers && atLeastOneWorkerHasTask;
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
          this.router.navigate(['/']);
        },
        (error) => {
          console.error('Error al crear la empresa:', error);
        }
      );
    } else {
      register$().subscribe(
        (company: Company) => {
          console.log('Empresa creada correctamente:', company);
          this.router.navigate(['/']);
        },
        (error) => {
          console.error('Error al crear la empresa:', error);
        }
      );
    }
  }
}