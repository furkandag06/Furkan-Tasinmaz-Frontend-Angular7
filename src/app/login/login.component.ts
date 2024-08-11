import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth-service.service';
import { LoginUser } from '../home/models/loginUser';
import { LogService } from '../log.service';
import * as alertify from 'alertifyjs'; // Import Alertify.js

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  passwordFieldType: string = 'password'; // Varsayılan olarak şifre gizli

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private logService: LogService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const user = new LoginUser(this.loginForm.value.email, this.loginForm.value.password);

      this.authService.login(user).subscribe(
        success => {
          if (success && success.token) {
            // Token'ı sakla
            localStorage.setItem('authToken', success.token);

            // Kullanıcı tipi ve ID'si
            const userId = success.userId || 0; // Varsayılan kullanıcı ID'si 0
            const userTip = success.userTip || 'bilinmiyor'; // Varsayılan kullanıcı tipi 'bilinmiyor'

            // Başarılı giriş mesajını logla
            this.logService.addLog(
              'Başarılı',
              'Login',
              `${user.email} email'li kullanıcı sisteme giriş yaptı`,
              userId,
              userTip
            ).subscribe(
              () => {
                console.log('Log kaydedildi');
              },
              error => {
                console.error('Log kaydedilirken hata oluştu:', error);
              }
            );

            // Ana sayfaya yönlendir
            this.router.navigate(['/home']).then(() => {
              alertify.success('Başarıyla giriş yaptınız!');
            }).catch(error => {
              console.error('Yönlendirme hatası:', error);
            });
          } else {
            // Giriş başarısızlık durumunu logla
            const userId = 0; // Varsayılan kullanıcı ID'si
            const userTip = 'bilinmiyor'; // Varsayılan kullanıcı tipi
            
            this.logService.addLog(
              'Başarısız',
              'Login',
              `${user.email} email'li kullanıcı sisteme giriş yapmaya çalıştı ancak token almayı başaramadı`,
              userId,
              userTip
            ).subscribe(
              () => {
                console.log('Başarısız giriş log kaydedildi');
              },
              error => {
                console.error('Başarısız giriş log kaydedilirken hata oluştu:', error);
              }
            );

            // Alertify ile giriş başarısızlık mesajı göster
            alertify.error('Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.');
          }
        },
        error => {
          alertify.error('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');

          // Hata durumunu logla
          const userId = 0; // Varsayılan kullanıcı ID'si
          const userTip = 'bilinmiyor'; // Varsayılan kullanıcı tipi

          this.logService.addLog(
            'Başarısız',
            'Login',
            'Kullanıcı sisteme giriş yapamadı. Hata: ' + error.message,
            userId,
            userTip
          ).subscribe(
            () => {
              console.log('Giriş hatası log kaydedildi');
            },
            error => {
              console.error('Giriş hatası log kaydedilirken hata oluştu:', error);
            }
          );
        }
      );
    } else {
      alert('Lütfen tüm alanları doğru şekilde doldurduğunuzdan emin olun.');
    }
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}
