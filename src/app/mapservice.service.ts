import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  // Koordinatları [number, number] dizisi olarak yaymak için Subject kullanıyoruz
  private coordinateSelectedSource = new Subject<[number, number]>();
  coordinateSelected$ = this.coordinateSelectedSource.asObservable();

  // Koordinatları yaymak için kullanılacak fonksiyon
  emitCoordinate(coordinate: [number, number]): void {
    this.coordinateSelectedSource.next(coordinate);
  }
}

