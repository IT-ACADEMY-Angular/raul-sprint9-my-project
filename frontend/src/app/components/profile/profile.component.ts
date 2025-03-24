import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../services/company.service';
import { UsersService } from '../../services/users.service';

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
    private usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (user && user.id) {
        this.companyService.getCompanyByUserId(user.id)
          .then((company) => {
            this.company = company;
          });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  deleteCompany(): void {
    if (!this.user) return;

    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar tu empresa?');
    if (!confirmDelete) return;

    this.companyService.deleteCompanyByOwnerId(this.user.id).subscribe({
      next: (response) => {
        alert(response.message);
        this.company = null;
      },
      error: (error) => {
        console.error('Error al eliminar la empresa:', error);
        alert('No se pudo eliminar la empresa.');
      }
    });
  }

  deleteAccount(): void {
    if (!this.user) return;

    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.');
    if (!confirmDelete) return;

    this.usersService.deleteAccount(this.user.id).subscribe({
      next: (response) => {
        alert(response.message);
        this.authService.logout();
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error al eliminar la cuenta:', error);
        alert('No se pudo eliminar la cuenta.');
      }
    });
  }
}