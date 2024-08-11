import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth-service.service';
import * as alertify from 'alertifyjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'tasinmaz3';
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  showNavbar: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showNavbar = !event.url.includes('/login');
        this.isLoggedIn = this.authService.isLoggedIn(); // Güncelle
        this.isAdmin = this.authService.isAdmin();     // Güncelle
      }
    });
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false; // Kullanıcı çıkış yaptığında durumu güncelle
  
    // Navigate to a different page and then show alertify message after a delay
    this.router.navigate(['/map']).then(() => {
      // Wait for 1 second before showing the alertify message
      setTimeout(() => {
        if (!this.authService.isLoggedIn()) {
          alertify.error('Uygulamaya Erişebilmek İçin Lütfen giriş yapınız.');
        }
      }, 6000); // 1000 milisaniye (1 saniye) bekle
    });
  }
}
