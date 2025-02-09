import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NgFor,NgIf } from '@angular/common';
import { FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

import axios from 'axios';

@Component({
  selector: 'app-center',
  imports: [FooterComponent, NgIf, RouterLink, NgFor, FormsModule, ReactiveFormsModule],
  templateUrl: './center.component.html',
  styleUrl: './center.component.css'
})
export class CenterComponent {
  isRegistered: boolean = false;
  isVerified: boolean = false;

  //Get user email from localstorage
  email = localStorage.getItem('email');
  userName = localStorage.getItem('userName');

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  center = {
    centerHeadEmail: '',
    centerName: '',
    centerType: '',
    registrationNumber: '',
    address: '',
    state: '',
    city: '',
    pincode: '',
    contactNumber: '',
    trainerCount: '',
    details: '',
    openingTime: '',
    closingTime: '',
    daysAvailable: [''],
    availableInstruments: [''],
    videos: [''],
    images: [''],
    latitude: '',
    longitude: '',
    isRegistered: false,
    isVerified: false,
  };
  centerDetails: any[] = []
  healthData: any;
  ngOnInit(){
    if(this.email){
      this.authService.gymRegistered(this.email).subscribe(
        (res) => {
          this.isRegistered = res.isRegistered;
          if(res.isRegistered){
            this.center = res.gym;
          }
        }
      )
    }
  }
  addField(field: 'images' | 'videos' | 'availableInstruments' | 'daysAvailable') {
    if (this.center[field][this.center[field].length - 1] !== '') {
      this.center[field].push('');
      setTimeout(() => {
        const inputs = document.querySelectorAll(`input[name=${field}${this.center[field].length - 1}]`);
        if (inputs.length > 0) {
          (inputs[0] as HTMLInputElement).focus();
        }
      });
    }
  }

  removeField(field: 'images' | 'videos' | 'availableInstruments' | 'daysAvailable', index: number) {
    if (this.center[field].length > 1) {
      this.center[field].splice(index, 1);
    }
  }
  trackByIndex(index: number, item: any): number {
    return index;
  }

  submitForm() {
    if (
      this.email &&
      this.center.centerName.trim() &&
      this.center.centerType.trim() &&
      this.center.registrationNumber.trim() &&
      this.center.address.trim() &&
      this.center.state.trim() &&
      this.center.city.trim() &&
      this.center.pincode.trim() &&
      this.center.contactNumber.trim() &&
      this.center.trainerCount.trim() &&
      this.center.details.trim() &&
      this.center.openingTime.trim() &&
      this.center.closingTime.trim() &&
      this.center.daysAvailable.some(day => day.trim() !== '') &&
      this.center.availableInstruments.some(inst => inst.trim() !== '') &&
      this.center.videos.some(video => video.trim() !== '') &&
      this.center.images.some(image => image.trim() !== '') &&
      this.center.latitude.trim() &&
      this.center.longitude.trim()
    ) {
      this.center.centerHeadEmail = this.email;
      console.log(this.center)
      this.authService.addGymDetails(this.center).subscribe(
        (res) => {
          window.location.reload();
          this.notification.showNotification('Gym details added successfully!','success');  // Show success message
        },
        (err) => {
          console.log(err)
          this.notification.showNotification(`${err.error.msg}`,'error');
        }
      )
    } else {
      alert('Please fill all required fields!');
    }
  }

  //Logout User
  logout() {
    const email = localStorage.getItem('email');
    if (email) {

      this.authService.logout(email).subscribe(
        (res) => {
          // Clear localStorage and update component state
          localStorage.clear();
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
}
