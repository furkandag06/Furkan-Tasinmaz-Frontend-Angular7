import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiserviceService {
  getNeighborhoodsByDistrict(districtId: number) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'https://localhost:44387/api/Tasinmaz'; // Ana API URL'i
  private cityUrl = 'https://localhost:44387/api/City';
  private districtUrl = 'https://localhost:44387/api/District'; // İlçelere göre güncellendi
  private neighborhoodUrl = 'https://localhost:44387/api/Neighborhood'; // Mahallelere göre güncellendi

  constructor(private http: HttpClient) { }

  // Taşınmazları almak için
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Şehirleri almak için
  getCities(): Observable<any[]> {
    return this.http.get<any[]>(this.cityUrl);
  }

  // Şehre göre ilçeleri almak için
  getDistricts(cityId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.districtUrl}/by-city/${cityId}`);
  }

  // İlçeye göre mahalleleri almak için
  getNeighborhoods(districtId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.neighborhoodUrl}/by-district/${districtId}`);
  }

  // Taşınmaz detaylarını almak için
  getPropertyDetails(propertyId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${propertyId}`);
  }

  // Taşınmaz eklemek için
  addData(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  // Taşınmaz güncellemek için
  update(id: number, updatedItem: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, updatedItem);
  }
  
  // Taşınmaz Silmek için
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  getTasinmazByUserId(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }
  getAllTasinmazlar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  
  

}



