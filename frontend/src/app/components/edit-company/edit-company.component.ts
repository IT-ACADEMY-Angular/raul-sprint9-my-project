import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkerListComponent } from '../worker-list/worker-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService, CreateCompanyPayload, Company } from '../../services/company.service';
import { WorkerData } from '../../models/worker.model';
import { switchMap } from 'rxjs';
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
  selector: 'edit-company-component',
  standalone: true,
  imports: [FormsModule, CommonModule, WorkerListComponent, EditWorkerModalComponent, MatDialogModule],
  templateUrl: './edit-company.component.html',
  styleUrls: ['./edit-company.component.css']
})
export class EditCompanyComponent {
  breadcrumb: string = 'Editar empresa';
  company: Company | null = null;
  companyName: string = '';
  companyPhotoUrl: string = '';
  previewPhotoUrl: string | null = null;
  selectedFile: File | null = null;
  workerData: WorkerData[] = [];
  newWorkerName: string = '';
  appointmentInterval: number = 5;
  showEditWorkerModal: boolean = false;
  workerToEdit!: WorkerData;
  workerToEditIndex: number = -1;

  private originalWorkersSnapshot: string = '';
  isSaving: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private router: Router,
    private companyService: CompanyService,
    private authService: AuthService,
    private dialog: MatDialog,
    private photoService: PhotoService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      const resolvedData = data as { company: Company | null };
      if (resolvedData.company) {
        this.company = resolvedData.company;
        this.companyName = resolvedData.company.name;
        this.companyPhotoUrl = resolvedData.company.photoUrl || '';
        this.workerData = resolvedData.company.workers ? [...resolvedData.company.workers] : [];
        this.originalWorkersSnapshot = JSON.stringify(this.workerData);
      } else {
        this.toastr.error('No se encontró empresa para el usuario.', 'Error');
        this.router.navigate(['/']);
      }
    });
  }

  goBack(): void {
    if (this.isFormModified()) {
      const confirmData: ConfirmDialogData = {
        title: 'Salir sin guardar',
        message: 'No se guardarán los cambios. ¿Desea salir?'
      };
      const dialogRef = this.dialog.open(ModalConfirmDialogComponent, {
        width: '300px',
        data: confirmData
      });
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result === true) {
          this.router.navigate(['']);
        }
      });
    } else {
      this.router.navigate(['']);
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
        this.toastr.error('Formato de imagen no permitido.', 'Error');
        return;
      }
      this.selectedFile = file;
      this.previewPhotoUrl = URL.createObjectURL(file);
    }
  }

  onImageError(event: Event): void {
    this.companyPhotoUrl = '';
  }

  uploadPhoto(file: File) {
    const uploadUrl = `${environment.apiUrl}/api/companies/photo`;
    return this.photoService.uploadPhoto(file, uploadUrl);
  }

  addWorker(): void {
    if (this.newWorkerName.trim() !== '') {
      this.workerData.push({ name: this.newWorkerName.trim() });
      this.newWorkerName = '';
    }
  }

  updateWorkers(workers: WorkerData[]): void {
    this.workerData = workers;
  }

  editWorker(event: { worker: WorkerData; index: number }): void {
    this.workerToEdit = JSON.parse(JSON.stringify(event.worker)); this.workerToEditIndex = event.index;
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
    const currentName = (this.companyName || '').trim();
    const originalName = ((this.company?.name) || '').trim();
    return (
      currentName !== originalName ||
      !!this.selectedFile ||
      JSON.stringify(this.workerData) !== this.originalWorkersSnapshot
    );
  }

  get isFormComplete(): boolean {
    const hasName = this.companyName.trim().length > 0;
    const wasPhotoProvidedOriginally = !!this.company?.photoUrl;
    const hasPhoto = wasPhotoProvidedOriginally ? (!!this.selectedFile || !!this.companyPhotoUrl) : true;

    if (this.workerData.length === 0) {
      return hasName && hasPhoto;
    } else {
      const atLeastOneWorkerHasTask = this.workerData.some(worker => worker.tasks && worker.tasks.length > 0);
      return hasName && hasPhoto && atLeastOneWorkerHasTask;
    }
  }

  updateCompany(): void {
    if (!this.company) return;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.toastr.error('Debes estar logueado para editar la empresa.', 'Error');
      return;
    }

    this.isSaving = true;

    if (this.selectedFile) {
      this.uploadPhoto(this.selectedFile).pipe(
        switchMap((result: string) => {
          this.companyPhotoUrl = result;
          const payload: CreateCompanyPayload = {
            ownerId: currentUser.id,
            name: this.companyName,
            photoUrl: this.companyPhotoUrl,
            workerData: this.workerData,
            appointmentInterval: this.appointmentInterval
          };
          return this.companyService.updateCompany(this.company!.id, payload);
        })
      ).subscribe(
        (updatedCompany: Company) => {
          this.company = updatedCompany;
          this.workerData = updatedCompany.workers || [];
          this.companyName = updatedCompany.name;
          this.companyPhotoUrl = updatedCompany.photoUrl || '';
          this.selectedFile = null;
          this.previewPhotoUrl = null;
          this.originalWorkersSnapshot = JSON.stringify(this.workerData);
          this.isSaving = false;
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
          this.router.navigate(['/edit-company']);
        },
        (error) => {
          console.error('Error al actualizar la empresa:', error);
          this.isSaving = false;
          this.toastr.error('Error al actualizar la empresa.', 'Error');
        }
      );
    } else {
      const payload: CreateCompanyPayload = {
        ownerId: currentUser.id,
        name: this.companyName,
        photoUrl: this.companyPhotoUrl || '',
        workerData: this.workerData,
        appointmentInterval: this.appointmentInterval
      };
      this.companyService.updateCompany(this.company.id, payload).subscribe(
        (updatedCompany: Company) => {
          this.company = updatedCompany;
          this.workerData = updatedCompany.workers || [];
          this.companyName = updatedCompany.name;
          this.companyPhotoUrl = updatedCompany.photoUrl || '';
          this.selectedFile = null;
          this.previewPhotoUrl = null;
          this.originalWorkersSnapshot = JSON.stringify(this.workerData);
          this.isSaving = false;
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
          this.router.navigate(['/edit-company']);
        },
        (error) => {
          console.error('Error al actualizar la empresa:', error);
          this.isSaving = false;
          this.toastr.error('Error al actualizar la empresa.', 'Error');
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
