import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = !!localStorage.getItem('token'); // Token kontrolü (kullanıcı giriş yaptı mı?)
    if (isLoggedIn) {
      return true;
    } else {
      this.router.navigate(['/login']); // Giriş yapmamışsa login sayfasına yönlendir
      return false;
    }
  }
}
