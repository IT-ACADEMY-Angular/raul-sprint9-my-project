import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Company, CompanyService } from '../../services/company.service';
import { UsersService } from '../../services/users.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalConfirmDialogComponent } from '../modal-confirm-dialog/modal-confirm-dialog.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'profile-component',
  imports: [RouterModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  breadcrumb: string = 'Perfil';
  user: any = null;
  company: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private companyService: CompanyService,
    private usersService: UsersService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private route: ActivatedRoute,

  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
    });
    this.route.data.subscribe((data) => {
      const resolvedData = data as { company: Company | null };
      if (resolvedData.company && (resolvedData.company as any).message) {
        this.company = null;
      } else {
        this.company = resolvedData.company;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.dialog.open(ModalConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Cerrar Sesión',
        message: '¿Estás seguro de que deseas cerrar sesión?'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.authService.logout();
        this.router.navigate(['/']);
      }
    });
  }

  deleteCompany(): void {
    if (!this.user) return;

    this.dialog.open(ModalConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Eliminar Empresa',
        message: '¿Estás seguro de que quieres eliminar tu empresa?'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.companyService.deleteCompanyByOwnerId(this.user.id).subscribe({
          next: (response) => {
            this.toastr.success(
              response.message,
              'Éxito',
              {
                timeOut: 5000,
                positionClass: 'toast-bottom-full-width',
                progressBar: true,
                progressAnimation: 'increasing'
              }
            );
            this.router.navigate(['/'], { queryParams: { refresh: new Date().getTime() } });
          },
          error: (error) => {
            console.error('Error al eliminar la empresa:', error);
            this.toastr.error(
              'No se pudo eliminar la empresa.',
              'Error',
              {
                timeOut: 5000,
                positionClass: 'toast-bottom-full-width',
                progressBar: true,
                progressAnimation: 'increasing'
              }
            );
          }
        });
      }
    });
  }

  deleteAccount(): void {
    if (!this.user) return;

    this.dialog.open(ModalConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Eliminar Cuenta',
        message: '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.usersService.deleteAccount(this.user.id).subscribe({
          next: (response) => {
            this.toastr.success(
              response.message,
              'Éxito',
              {
                timeOut: 7000,
                positionClass: 'toast-bottom-full-width',
                progressBar: true,
                progressAnimation: 'increasing'
              }
            );
            this.authService.logout();
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Error al eliminar la cuenta:', error);
            this.toastr.error(
              'No se pudo eliminar la cuenta.',
              'Error',
              {
                timeOut: 7000,
                positionClass: 'toast-bottom-full-width',
                progressBar: true,
                progressAnimation: 'increasing'
              }
            );
          }
        });
      }
    });
  }
}