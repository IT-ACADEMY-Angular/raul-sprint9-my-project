import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'navbar-component',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  title: string = 'ZYTAPP';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateTitle(event.url);
      }
    });
  }

  updateTitle(url: string) {
    switch (url) {
      case '/editar-perfil':
        this.title = 'EDITAR PERFIL';
        break;
      default:
        this.title = 'ZYTAPP';
        break;
    }
  }
}