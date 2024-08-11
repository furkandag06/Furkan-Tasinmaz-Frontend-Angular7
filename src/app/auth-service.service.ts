import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoginUser } from './home/models/loginUser';
import { User } from './home/models/User';
import jwt_decode from 'jwt-decode';
import { LogService } from './log.service';
import alertify from 'alertifyjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:44387/api/Auth';
  private authTokenKey = 'authToken';

  constructor(
    private http: HttpClient,
    private router: Router,
    private logService: LogService
  ) {}

  login(user: LoginUser): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, user).pipe(
      tap(response => {
        if (response && response.token) {
          this.storeToken(response.token);
          this.storeUserId(response.token);
        } else {
          console.error('Yanıt beklenen token özelliğini içermiyor:', response);
        }
      }),
      catchError(this.handleError<any>('login'))
    );
  }

  logout(): void {
    const token = localStorage.getItem(this.authTokenKey);
    const userId = localStorage.getItem('userId');
    const email = token ? this.decodeToken(token).email : 'unknown';
    const role = token ? this.decodeToken(token).role : 'unknown';
  
    // Clear session data immediately
    localStorage.removeItem(this.authTokenKey);
    localStorage.removeItem('userId');
  
    if (userId) {
      this.logService.addLog('Başarılı', 'Logout', `Kullanıcı ${userId} (${email}, ${role}) çıkış yaptı.`, +userId, role)
        .subscribe(
          response => {
            console.log('Log başarıyla kaydedildi:', response);
            alertify.success('Çıkış işlemi başarıyla gerçekleştirildi.');
          },
          error => {
            console.error('Log kaydedilirken hata:', error);
            alertify.error('Log kaydedilirken bir hata oluştu.');
          }
        );
    } else {
      alertify.success('Çıkış işlemi başarıyla gerçekleştirildi.').delay(500);
    }
  
    // Navigate to login page without reloading
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.authTokenKey);
  }

  isAdmin(): boolean {
    const token = localStorage.getItem(this.authTokenKey);
    if (token) {
      const decodedToken: any = this.decodeToken(token);
      return decodedToken && decodedToken.role === 'admin';
    }
    return false;
  }

  getUserId(): string {
    const token = localStorage.getItem(this.authTokenKey);
    if (token) {
      const decodedToken: any = this.decodeToken(token);
      return decodedToken ? decodedToken.nameid : '';
    }
    return '';
  }

  register(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user).pipe(
      tap(response => {
        console.log('Kayıt başarılı', response);
      }),
      catchError(this.handleError<any>('register'))
    );
  }

  getToken(): string {
    return localStorage.getItem(this.authTokenKey) || '';
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.authTokenKey, token);
  }

  private storeUserId(token: string): void {
    const decodedToken: any = this.decodeToken(token);
    if (decodedToken) {
      localStorage.setItem('userId', decodedToken.nameid);
    }
  }

  private decodeToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch (error) {
      console.error('Token decode hatası:', error);
      return null;
    }
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
