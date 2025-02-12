import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { User } from '../../interfaces/auth.interfaces';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'navbar-component',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  title: string = 'ZYTAPP';
  user: User | null = null;
  showProfileIcon: boolean = true;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.getChild(this.activatedRoute);
        const hideIcon = currentRoute.snapshot.data['hideProfileIcon'];
        this.showProfileIcon = !hideIcon;
        if (currentRoute.snapshot.data['title']) {
          this.title = currentRoute.snapshot.data['title'];
        } else {
          this.title = 'ZYTAPP';
        }
      });
  }

  private getChild(route: ActivatedRoute): ActivatedRoute {
    if (route.firstChild) {
      return this.getChild(route.firstChild);
    }
    return route;
  }
}