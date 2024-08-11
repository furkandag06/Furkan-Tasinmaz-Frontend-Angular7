import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoordinateService {
  private apiUrl = 'https://localhost:44387/api/Tasinmaz'; // API URL'niz

  constructor(private http: HttpClient) {}

  getCoordinates(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  setCoordinates(coords: { longitude: number, latitude: number }) {
    // Koordinatları işleyen kod
  }
}

