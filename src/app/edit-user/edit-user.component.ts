import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../home/models/User';
import { UserService } from '../user.service';
import { LogService } from '../log.service';
import * as alertify from 'alertifyjs'; // Alertify.js'i import edin

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent {
  @Input() user: User;
  @Output() userUpdated = new EventEmitter<void>();

  constructor(
    private userService: UserService,
    private logService: LogService,
    public activeModal: NgbActiveModal
  ) {}

  updateUser(): void {
    if (this.user && this.user.id) {
      this.userService.update(this.user.id, this.user).subscribe(
        () => {
          // Function to remove sensitive fields
          const sanitizeUser = (user: User): any => {
            const { passwordHash, passwordSalt, ...sanitizedUser } = user;
            return sanitizedUser;
          };

          // Başarılı güncelleme logu
          const successLog = {
            durum: 'Başarılı',
            islemTip: 'Kullanıcı Düzenleme',
            aciklama: `Kullanıcı başarıyla güncellendi. ID: ${this.user.id}. Detaylar: ${JSON.stringify(sanitizeUser(this.user))}`,
            kullaniciId: this.user.id,
            kullaniciTip: 'Admin' // veya uygun bir kullanıcı tipi
          };
          this.logService.addLog(successLog.durum, successLog.islemTip, successLog.aciklama, successLog.kullaniciId, successLog.kullaniciTip).subscribe(
            () => console.log(`Log kaydedildi: ${successLog.aciklama}`),
            error => console.error('Log kaydedilirken hata oluştu:', error)
          );

          this.userUpdated.emit();
          this.closeModal();
          alertify.success('Kullanıcı başarıyla güncellendi.'); // Alertify.js ile başarı mesajı göster
        },
        (error) => {
          console.error('Kullanıcı güncellenirken hata oluştu', error);

          // Başarısız güncelleme logu
          const failureLog = {
            durum: 'Başarısız',
            islemTip: 'Kullanıcı Düzenleme',
            aciklama: `Kullanıcı güncellenirken hata oluştu. ID: ${this.user.id}. Hata: ${error.message}`,
            kullaniciId: this.user.id,
            kullaniciTip: 'Admin' // veya uygun bir kullanıcı tipi
          };
          this.logService.addLog(failureLog.durum, failureLog.islemTip, failureLog.aciklama, failureLog.kullaniciId, failureLog.kullaniciTip).subscribe(
            () => console.log(`Log kaydedildi: ${failureLog.aciklama}`),
            error => console.error('Log kaydedilirken hata oluştu:', error)
          );
          alertify.error(`Kullanıcı güncellenirken hata oluştu: ${error.message}`); // Alertify.js ile hata mesajı göster
        }
      );
    }
  }

  closeModal(): void {
    this.activeModal.dismiss(); // Modal'ı kapat
  }
}
