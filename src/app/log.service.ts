import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private logUrl = 'https://localhost:44387/api/Log'; // Logları backend'e göndereceğiniz URL

  constructor(private http: HttpClient) {}

  // Logları gönderme
  log(message: string, level: string = 'info'): Observable<any> {
    const logEntry = {
      message,
      level,
      timestamp: new Date().toISOString()
    };
    return this.http.post(this.logUrl, logEntry);
  }

  // Etkileşimleri loglama
  addLog(durum: string, islemTip: string, aciklama: string, kullaniciId?: number, kullaniciTip?: string): Observable<any> {
    const logEntry = {
      kullaniciId: kullaniciId || 0, // Eğer kullaniciId sağlanmazsa, 0 olarak varsayalım
      durum,
      islemTip,
      aciklama,
      tarihveSaat: new Date().toISOString(),
      kullaniciTip: kullaniciTip || 'bilinmiyor' // Eğer kullaniciTip sağlanmazsa, 'bilinmiyor' olarak varsayalım
    };
    console.log('Gönderilen log verisi:', logEntry);
    return this.http.post(this.logUrl, logEntry);
  }

  // Logları alma
  getLogs(): Observable<any[]> {
    return this.http.get<any[]>(this.logUrl);
  }
}
