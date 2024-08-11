import { Component, OnInit } from '@angular/core';
import { LogService } from '../log.service';
import { Log } from '../home/models/log';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../auth-service.service';
import alertify from 'alertifyjs';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css'],
  providers: [DatePipe]
})
export class LogComponent implements OnInit {
  logs: Log[] = [];
  filteredLogs: Log[] = [];
  selectedLog?: Log;
  searchTerm: string = '';
  loading: boolean = true;
  isAdmin: boolean = false;

  filterCriteria = {
    durum: '',
    islemTip: '',
    tarihveSaat: ''
  };

  durumList: string[] = ['Başarılı', 'Başarısız'];
  islemTipList: string[] = ['Login', 'Logout', 'Kullanıcı Düzenleme', 'Kullanıcı Silme', 'Kullanıcı Ekleme', 'Taşınmaz Ekleme', 'Taşınmaz Silme', 'Taşınmaz Düzenleme'];

  constructor(
    private logService: LogService,
    private authService: AuthService,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    if (this.isAdmin) {
      this.loadLogs();
    } else {
      alert("Bu sayfayı görüntüleme izniniz yok. Lütfen yetkili kullanıcı olarak giriş yapınız.");
      this.router.navigate(['/home']);
    }
  }

  loadLogs(): void {
    this.logService.getLogs().subscribe(data => {
      this.logs = data;
      this.filteredLogs = this.sortLogsByDate(data);
      this.loading = false;
    });
  }

  sortLogsByDate(logs: Log[]): Log[] {
    return logs.sort((a, b) => {
      const dateA = new Date(a.tarihveSaat).getTime();
      const dateB = new Date(b.tarihveSaat).getTime();
      return dateB - dateA; // Azalan sırada sıralama
    });
  }

  searchLogs(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredLogs = this.logs;
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredLogs = this.logs.filter(log => {
        return (
          (log.id.toString() === searchTermLower) ||
          (log.kullaniciId.toString().toLowerCase() === searchTermLower) ||
          (log.durum.toLowerCase() === searchTermLower) ||
          (log.islemTip.toLowerCase() === searchTermLower) ||
          (log.aciklama.toLowerCase() === searchTermLower) ||
          (log.kullaniciTip.toLowerCase() === searchTermLower)
        );
      });
    }
  }
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredLogs = this.logs;
  }

  exportToExcel(): void {
    if (!this.isAdmin) {
      alert("Bu işlemi sadece adminler yapabilir.");
      this.router.navigate(['/home']);
      return;
    }
  
    // Seçili olan logları filtrele
    const selectedLogs = this.filteredLogs.filter(log => log.selected);
  
    if (selectedLogs.length === 0) {
      alert("Lütfen Excel'e aktarmak için en az bir log seçin.");
      return;
    }
  
    // `selected` özelliğini çıkarmak için map kullanarak sadece gerekli verileri alıyoruz
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(selectedLogs.map(log => ({
      durum: log.durum,
      islemTip: log.islemTip,
      aciklama: log.aciklama,
      kullaniciTip: log.kullaniciTip,
      tarihveSaat: this.datePipe.transform(log.tarihveSaat, 'dd/MM/yyyy HH:mm')
    })));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Logs');
    XLSX.writeFile(wb, 'loglar.xlsx');
  
    alertify.success('Loglar başarıyla Excel dosyasına aktarıldı.');
  }

  viewDetails(log: Log): void {
    this.selectedLog = log;
  }

  closeDetails(): void {
    this.selectedLog = undefined;
  }

  selectAll(event: any): void {
    const isChecked = event.target.checked;
    this.filteredLogs.forEach(log => log.selected = isChecked);
  }

  applyFilters(): void {
    this.filteredLogs = this.logs.filter(log => {
      return (
        (this.filterCriteria.durum === '' || log.durum.toLowerCase() === this.filterCriteria.durum.toLowerCase()) &&
        (this.filterCriteria.islemTip === '' || log.islemTip.toLowerCase() === this.filterCriteria.islemTip.toLowerCase()) &&
        (this.filterCriteria.tarihveSaat === '' || 
          this.datePipe.transform(log.tarihveSaat, 'dd/MM/yyyy HH:mm') === 
          this.datePipe.transform(this.filterCriteria.tarihveSaat, 'dd/MM/yyyy HH:mm'))
      );
    });
  }
}
