import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { LoadingService } from '../services/loading.service';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.headers.has('X-Skip-Loading')) {
      const clonedReq = req.clone({
        headers: req.headers.delete('X-Skip-Loading')
      });
      return next.handle(clonedReq);
    }

    this.loadingService.show();
    return next.handle(req).pipe(
      finalize(() => this.loadingService.hide())
    );
  }
}