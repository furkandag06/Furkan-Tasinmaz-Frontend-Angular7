import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditModalComponent } from '../edit-modal/edit-modal.component';
import { DeleteModalComponent } from '../delete-modal/delete-modal.component';
import { ApiserviceService } from '../apiservice.service';
import { LogService } from '../log.service';
import { MapService } from '../mapservice.service';
import { catchError, concatMap, tap } from 'rxjs/operators';
import { from, of } from 'rxjs';
import * as alertify from 'alertifyjs';
import { AuthService } from '../auth-service.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  tasinmazlar: any[] = [];
  paginatedItems: any[][] = [];
  currentPage: number = 0;
  itemsPerPage: number = 5;
  selectedItem: any;
  selectedItemId: number | null = null;
  selectedCoordinate: string = '';
  searchTerm: string = '';
  filteredItems: any[] = [];
  selectedItems: any[] = [];
  isAdmin: boolean = false;

  constructor(
    private apiService: ApiserviceService,
    private modalService: NgbModal,
    private logService: LogService,
    private mapService: MapService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();

    if (this.authService.isLoggedIn()) {
      this.getTasinmazlar();
    } else {
      console.error('Kullanıcı giriş yapmamış.');
    }
  }

  getTasinmazlar() {
    if (this.isAdmin) {
      this.apiService.getAllTasinmazlar().subscribe(
        data => {
          console.log('Veri alındı (Admin):', data);
          this.tasinmazlar = data.sort((a: any, b: any) => a.id - b.id);
          this.filterItems();
          this.paginateItems();
        },
        error => console.error('Veri yükleme hatası (Admin):', error)
      );
    } else {
      const userId = this.authService.getUserId();
      if (userId) {
        this.apiService.getTasinmazByUserId(userId).subscribe(
          data => {
            console.log('Veri alındı (Kullanıcı):', data);
            this.tasinmazlar = data.sort((a: any, b: any) => a.id - b.id);
            this.filterItems();
            this.paginateItems();
          },
          error => console.error('Veri yükleme hatası (Kullanıcı):', error)
        );
      } else {
        console.error('Kullanıcı ID bulunamadı');
      }
    }
  }

  paginateItems() {
    const length = this.filteredItems.length;
    this.paginatedItems = [];
    for (let i = 0; i < length; i += this.itemsPerPage) {
      this.paginatedItems.push(this.filteredItems.slice(i, i + this.itemsPerPage));
    }
    console.log('Paginated items:', this.paginatedItems);
  }

  filterItems() {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredItems = this.tasinmazlar.filter(item =>
      item.neigborhood.district.city.name.toLowerCase().includes(searchTermLower) ||
      item.neigborhood.district.districtName.toLowerCase().includes(searchTermLower) ||
      item.neigborhood.neigborhoodName.toLowerCase().includes(searchTermLower) ||
      item.island.toLowerCase().includes(searchTermLower) ||
      item.parcel.toLowerCase().includes(searchTermLower) ||
      item.quality.toLowerCase().includes(searchTermLower) ||
      item.coordinateInformation.toLowerCase().includes(searchTermLower) ||
      item.userId.toString().toLowerCase().includes(searchTermLower)
    );
    this.paginateItems();
  }

  searchItems(): void {
    this.filterItems();
  }

  onCheckboxChange(item: any, event: any) {
    if (event.target.checked) {
      this.selectedItems.push(item);
    } else {
      this.selectedItems = this.selectedItems.filter(selectedItem => selectedItem.id !== item.id);
    }
  }

  openEditModal() {
    if (this.selectedItems.length === 1) {
      this.selectedItem = { ...this.selectedItems[0] };
      const modalRef = this.modalService.open(EditModalComponent, {
        backdrop: 'static',
        keyboard: false
      });
      modalRef.componentInstance.item = this.selectedItem;

      modalRef.result.then(
        (result) => {
          if (result === 'Save click') {
            this.handleSave(this.selectedItem);
          }
        },
        (reason) => {
          console.log('Edit modal kapandı:', reason);
        }
      );
    } else {
      alertify.error('Lütfen sadece bir öğe seçin.');
    }
  }

  handleSave(updatedItem: any) {
    const originalItem = this.tasinmazlar.find(item => item.id === updatedItem.id);

    this.apiService.update(updatedItem.id, updatedItem).subscribe(
      response => {
        console.log('Güncelleme başarılı:', response);
        this.getTasinmazlar();
        alertify.success('Taşınmaz başarıyla güncellendi.');

        this.logService.addLog(
          'Başarılı',
          'Taşınmaz Düzenleme',
          `Taşınmaz (ID: ${updatedItem.id}, Detaylar: ${JSON.stringify(originalItem)}) başarıyla güncellendi.`
        ).subscribe(
          () => console.log('Log kaydedildi.'),
          error => console.error('Log kaydedilirken hata oluştu:', error)
        );
      },
      error => {
        console.error('Güncelleme hatası:', error);
        alertify.error(`Güncelleme hatası: ${JSON.stringify({ error, id: updatedItem.id })}`);

        this.logService.addLog(
          'Başarısız',
          'Taşınmaz Düzenleme',
          `Taşınmaz (ID: ${updatedItem.id}, Detaylar: ${JSON.stringify(originalItem)}) güncellenirken hata oluştu: ${JSON.stringify({ error, id: updatedItem.id })}`
        ).subscribe(
          () => console.log('Log kaydedildi.'),
          error => console.error('Log kaydedilirken hata oluştu:', error)
        );
      }
    );
  }

  handleClose() {
    this.selectedItem = null;
  }

  openDeleteModal() {
    if (this.selectedItems.length > 0) {
      const modalRef = this.modalService.open(DeleteModalComponent, {
        backdrop: 'static',
        keyboard: false
      });
      modalRef.componentInstance.items = this.selectedItems;

      modalRef.result.then(
        (result) => {
          if (result === 'Delete click') {
            const idsToDelete = this.selectedItems.map(item => item.id);
            this.confirmDelete(idsToDelete);
          }
        },
        (reason) => {
          console.log('Silme modalı kapandı:', reason);
        }
      );
    } else {
      alertify.error('Lütfen silinecek öğe seçin.');
    }
  }

  confirmDelete(ids: number[]) {
    const deleteObservables = ids.map(id =>
      from(this.apiService.delete(id)).pipe(
        tap(() => console.log(`Taşınmaz başarıyla silindi.`)),
        catchError(error => {
          console.error(`Taşınmaz (ID: ${id}) silinirken hata oluştu:`, error);
          alertify.error(`Taşınmaz silinirken hata oluştu.`);
          return of(null);
        })
      )
    );

    from(deleteObservables).pipe(
      concatMap(observable => observable),
      tap(() => {
        this.getTasinmazlar();
        alertify.success('Seçili taşınmazlar başarıyla silindi.');
      })
    ).subscribe();
  }

  exportToExcel() {
    if (this.selectedItems.length > 0) {
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.selectedItems.map(item => ({
        City: item.neigborhood.district.city.name,
        District: item.neigborhood.district.districtName,
        Neighborhood: item.neigborhood.neigborhoodName,
        Island: item.island,
        Parcel: item.parcel,
        Quality: item.quality,
        Coordinates: item.coordinateInformation,
      })));

      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Selected Items');

      XLSX.writeFile(wb, 'Tasinmaz.xlsx');
    } else {
      alertify.error('Lütfen export edilecek öğeleri seçin.');
    }
  }
}
