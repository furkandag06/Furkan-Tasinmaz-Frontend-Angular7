import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from './home/models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userApiUrl = 'https://localhost:44387/api/User'; // Kullanıcı işlemleri için URL
  private authApiUrl = 'https://localhost:44387/api/Auth/register'; // Kayıt işlemleri için URL

  constructor(private http: HttpClient) { }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.userApiUrl).pipe(
      catchError(this.handleError)
    );
  }

  addUser(user: User): Observable<User> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<User>(this.userApiUrl, user, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  registerUser(user: User): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.authApiUrl, user, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.userApiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, user: User): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(`${this.userApiUrl}/${id}`, user, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
