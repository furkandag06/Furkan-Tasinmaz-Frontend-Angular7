import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../user.service';
import { LogService } from '../log.service'; // LogService'yi import edin

@Component({
  selector: 'app-user-delete',
  templateUrl: './user-delete.component.html',
  styleUrls: ['./user-delete.component.css']
})
export class UserDeleteComponent {
  @Input() userId: number | null = null; // Silinecek kullanıcının ID'si

  constructor(
    public activeModal: NgbActiveModal,
    private userService: UserService,
    private logService: LogService // LogService'yi inject edin
  ) { }

  // Silme işlemini onaylamak için metod
  confirmDelete(): void {
    if (this.userId != null) {
      this.userService.delete(this.userId).subscribe(
        () => {
          // Başarılı silme logu
          this.createLog('Başarılı', 'Kullanıcı Silme', `Kullanıcı başarıyla silindi. ID: ${this.userId}`);
          this.activeModal.close('deleted'); // Modal'ı kapat ve 'deleted' sonucu döndür
        },
        (error) => {
          // Başarısız silme logu
          this.createLog('Başarısız', 'Kullanıcı Silme', `Kullanıcı silinirken hata oluştu. ID: ${this.userId}. Hata: ${error.message}`);
          console.error(`Silme işlemi başarısız oldu. Kullanıcı ID: ${this.userId}. Hata:`, error);
          this.activeModal.dismiss(); // Modal'ı kapat
        }
      );
    }
  }

  // Modal'ı kapatmak için metod
  close(): void {
    this.activeModal.dismiss(); // Modal'ı kapat
  }

  // Log kaydı oluşturma metod
  private createLog(durum: string, islemTip: string, aciklama: string): void {
    const log = {
      durum: durum,
      islemTip: islemTip,
      aciklama: aciklama,
      kullaniciId: this.userId, // Silinen kullanıcının ID'si
      kullaniciTip: 'Admin' // veya uygun bir kullanıcı tipi, örn. 'Admin'
    };
    this.logService.addLog(log.durum, log.islemTip, log.aciklama, log.kullaniciId, log.kullaniciTip).subscribe(
      () => console.log(`Log kaydedildi: ${log.aciklama}`),
      error => console.error('Log kaydedilirken hata oluştu:', error)
    );
  }
}
