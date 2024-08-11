import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import * as CryptoJS from 'crypto-js';
import { LogService } from '../log.service';
import { User } from '../home/models/User';
import * as alertify from 'alertifyjs';

@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.css']
})
export class AddUserModalComponent implements OnInit {
  userForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private userService: UserService,
    private logService: LogService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
      address: [''],
      role: ['']
    });
  }

  ngOnInit(): void {}

  saveUser(): void {
    if (this.userForm.valid) {
      const formValues = this.userForm.value;
      const passwordHash = CryptoJS.SHA256(formValues.password).toString();
      const passwordSalt = CryptoJS.lib.WordArray.random(128 / 8).toString();
  
      const newUser: User = {
        name: formValues.name,
        surname: formValues.surname,
        email: formValues.email,
        phone: formValues.phone,
        address: formValues.address,
        role: formValues.role.toLowerCase(), // Küçük harfe dönüştürme
        password: formValues.password,
        passwordHash: passwordHash,
        passwordSalt: passwordSalt
      };
  
      this.userService.registerUser(newUser).subscribe({
        next: (response) => {
          this.successMessage = 'Kullanıcı başarıyla kaydedildi.';
          this.createLog('Başarılı', 'Kullanıcı Ekleme', `Yeni kullanıcı başarıyla eklendi. Email: ${formValues.email}`);
          this.activeModal.close('saved');
          alertify.success('Kullanıcı başarıyla eklendi.');
  
          // Token'ı saklama
          if (response && response.token) {
            localStorage.setItem('authToken', response.token);
          }
        },
        error: (err) => {
          console.error('Kullanıcı kaydedilirken hata oluştu', err);
          let errorMessages = 'Bir hata oluştu.';
          if (err.error && err.error.errors) {
            const validationErrors = err.error.errors;
            const errorMessagesArray = [].concat.apply([], Object.values(validationErrors));
            errorMessages = errorMessagesArray.join(', ');
          } else if (err.message) {
            errorMessages = err.message;
          }
          this.errorMessage = `Hata: ${errorMessages}`;
          this.createLog('Başarısız', 'Kullanıcı Ekleme', `Kullanıcı eklenirken hata oluştu. Email: ${formValues.email}. Hata: ${errorMessages}`);
          alertify.error(`Hata: ${errorMessages}`);
        }
      });
    } else {
      const formErrors = this.getFormErrors();
      console.warn('Form geçerli değil:', formErrors);
      this.errorMessage = 'Formunuz geçerli değil. Lütfen gerekli alanları doldurun.';
      alertify.error('Formunuz geçerli değil. Lütfen gerekli alanları doldurun.');
    }
  }  

  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.userForm.controls).forEach(controlName => {
      const control = this.userForm.get(controlName);
      if (control && control.invalid) {
        errors[controlName] = control.errors;
      }
    });
    return errors;
  }

  private createLog(durum: string, islemTip: string, aciklama: string): void {
    const sanitizedDescription = aciklama.replace(/passwordHash:.*?, /, '').replace(/passwordSalt:.*?/, '');
    const log = {
      durum: durum,
      islemTip: islemTip,
      aciklama: sanitizedDescription,
      kullaniciId: null,
      kullaniciTip: 'Admin'
    };
    this.logService.addLog(log.durum, log.islemTip, log.aciklama, log.kullaniciId, log.kullaniciTip).subscribe(
      () => console.log(`Log kaydedildi: ${log.aciklama}`),
      error => console.error('Log kaydedilirken hata oluştu:', error)
    );
  }
}
