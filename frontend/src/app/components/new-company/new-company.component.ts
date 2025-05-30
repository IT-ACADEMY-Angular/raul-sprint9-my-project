import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkerListComponent } from '../worker-list/worker-list.component';
import { Router } from '@angular/router';
import { CompanyService, CreateCompanyPayload, Company } from '../../services/company.service';
import { WorkerData } from '../../models/worker.model';
import { debounceTime, distinctUntilChanged, Observable, Subject, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { EditWorkerModalComponent } from '../edit-worker-modal/edit-worker-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalConfirmDialogComponent } from '../modal-confirm-dialog/modal-confirm-dialog.component';
import { ConfirmDialogData } from '../../interfaces/confirm-dialog-data.interface';
import { PhotoService } from '../../services/photo.service';
import { PhotoCropModalComponent } from '../photo-crop-modal/photo-crop-modal.component';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';



@Component({
  selector: 'new-company-component',
  standalone: true,

  imports: [FormsModule, CommonModule, WorkerListComponent, EditWorkerModalComponent, MatDialogModule],
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
  workerNameDuplicate: boolean = false;

  appointmentInterval: number = 5;

  showEditWorkerModal: boolean = false;
  workerToEdit!: WorkerData;
  workerToEditIndex: number = -1;

  companyNameTaken: boolean = false;
  companyNameChange$ = new Subject<string>();

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private router: Router,
    private companyService: CompanyService,
    private authService: AuthService,
    private dialog: MatDialog,
    private photoService: PhotoService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.companyNameChange$.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((name: string) => {
      if (!name) {
        this.companyNameTaken = false;
        return;
      }
      this.companyService.searchCompanies(name).subscribe(
        (companies) => {
          this.companyNameTaken = companies.some(
            company => company.name.trim().toLowerCase() === name.toLowerCase()
          );
        },
        (error) => {
          console.error('Error al verificar el nombre de la empresa:', error);
          this.companyNameTaken = false;
        }
      );
    });
  }

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

  onImageError(event: Event): void {
    this.companyPhotoUrl = '';
  }

  uploadPhoto(file: File): Observable<string> {
    const uploadUrl = `${environment.apiUrl}/api/companies/photo`;
    return this.photoService.uploadPhoto(file, uploadUrl);
  }

  onCompanyNameChange(): void {
    const trimmedName = this.companyName.trim();
    this.companyNameChange$.next(trimmedName);
  }

  validateWorkerName(): void {
    const trimmedName = this.newWorkerName.trim();
    if (!trimmedName) {
      this.workerNameDuplicate = false;
      return;
    }
    this.workerNameDuplicate = this.workerData.some(worker =>
      worker.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
  }

  addWorker(): void {
    const trimmedName = this.newWorkerName.trim();
    if (trimmedName !== '') {
      if (this.workerData.some(worker => worker.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
        this.workerNameDuplicate = true;
        return;
      }
      this.workerData.push({ name: trimmedName });
      this.newWorkerName = '';
      this.workerNameDuplicate = false;
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
    const hasWorkers = this.workerData.length > 0;
    const atLeastOneWorkerHasTask = this.workerData.some(worker => worker.tasks && worker.tasks.length > 0);
    return hasName && hasWorkers && atLeastOneWorkerHasTask;
  }

  registrarEmpresa(): void {
    if (this.companyNameTaken) {
      this.toastr.error('Ya hay una empresa con este nombre.', 'Error');
      return;
    }
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.toastr.error('Debes estar logueado para registrar una empresa.', 'Error');
      return;
    }
    const ownerId = currentUser.id;

    const register$ = () => {
      const payload: CreateCompanyPayload = {
        ownerId,
        name: this.companyName,
        photoUrl: this.companyPhotoUrl || '',
        workerData: this.workerData,
        appointmentInterval: this.appointmentInterval
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
          this.toastr.success(
            'Empresa creada correctamente',
            '',
            {
              timeOut: 5000,
              positionClass: 'toast-bottom-full-width',
              progressBar: true,
              progressAnimation: 'increasing'
            }
          );
          this.router.navigate(['/']);
        },
        (error) => {
          console.error('Error al crear la empresa:', error);
        }
      );
    } else {
      register$().subscribe(
        (company: Company) => {
          this.toastr.success(
            'Empresa creada correctamente',
            '',
            {
              timeOut: 5000,
              positionClass: 'toast-bottom-full-width',
              progressBar: true,
              progressAnimation: 'increasing'
            }
          );
          this.router.navigate(['/']);
        },
        (error) => {
          console.error('Error al crear la empresa:', error);
        }
      );
    }
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
}