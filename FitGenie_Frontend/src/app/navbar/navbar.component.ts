import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

import { Router, RouterLink, RouterModule } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [NgIf, RouterLink, RouterModule ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  loggedIn = false;
  isAdmin = false;
  activeMenu: string = 'home'; // Default active menu item
  token = localStorage.getItem('token');
  showBookmarkBtn:boolean = false;


  constructor(
    private authService: AuthService,
    public router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.checkLoggedInStatus();
    //To show Bookmark button if logged in
    if(this.token){
      this.showBookmarkBtn = true;
    }
  }
  setActive(menu: string, url: String): void {
    this.activeMenu = menu;
    this.router.navigate([url]);
  }
  checkLoggedInStatus() {
    const token = localStorage.getItem('token');
    if (token) {
      this.loggedIn = true;
      this.isAdmin = localStorage.getItem('isAdmin') === 'true';
    } else {
      this.loggedIn = false; // Ensure this sets `loggedIn` to false if no token
    }
  }

  navigate(){
    if(localStorage.getItem('isAdmin')){
      this.router.navigate(['/admin']);
    }
    else if(localStorage.getItem('isFitnessCenter')){
      this.router.navigate(['/center']);
    }
    else{
      this.router.navigate(['/user']);
    }
  }
  logout() {
    const email = localStorage.getItem('email');
    if (email) {

      this.authService.logout(email).subscribe(
        (res) => {
          // Clear localStorage and update component state
          localStorage.clear();
          this.loggedIn = false;
          this.isAdmin = false;

          // Navigate back to the login page
          this.router.navigate(['/login']);
          this.notification.showNotification(`${res.msg}`,'success');  // Show success message
        },
        (err) => {
          this.notification.showNotification(`${err.error.msg}`,'error');
        }
      );
    }
  }

  goToSection(section: string) {
    // Navigate to the home component and scroll to the #about section
    this.router.navigate([''], { fragment: `${section}` });
    if (this.router.url === '/') {
      const gallerySection = document.getElementById(section);
      if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      this.router.navigate(['/']).then(() => {
        const gallerySection = document.getElementById(section);
        if (gallerySection) {
          gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  displayNavMobile(){
    const nav= document.getElementById('navMobile') ;
    if(nav){
      nav.style.display = nav.style.display === "flex"? "none" : "flex";
    }
  }

  closeNav(){
    const nav= document.getElementById('navMobile') ;
    if(nav){
      nav.style.display = "none";
    }
  }
}
