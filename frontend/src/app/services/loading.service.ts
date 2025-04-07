import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  show(): void {
    setTimeout(() => {
      this.loadingSubject.next(true);
    });
  }

  hide(): void {
    setTimeout(() => {
      this.loadingSubject.next(false);
    });
  }
}
