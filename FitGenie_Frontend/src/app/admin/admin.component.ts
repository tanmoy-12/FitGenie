import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NgFor,NgIf } from '@angular/common';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FooterComponent, FormsModule, RouterLink, NgFor, NgIf,],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  loggedIn = false;
  isAdmin = false;
  isExerciseForm: boolean = false;

  //Get user email from localstorage
  email = localStorage.getItem('email');
  userName = localStorage.getItem('userName');

  unVerifiedCentres : any[] = [];
  selectedGym = {
    _id: '',
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
  };
  isGettingCenters : boolean = false;
  isDetails: boolean = false;

  exerciseData: any = {
    exerciseName: '',
    exerciseType: '',
    exerciseDuration: '',
    exerciseMuscleGroup: '',
    difficultyLevel: '',
    images: [''],
    videos: [''],
    equipments: [''],
    details: '',
    exerciseCategory: '',
    benefits: '',
    limitations: '',
    procedures: [''],
    precautions: '',
  };


  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);


  ngOnInit(): void {
    this.isGettingCenters = true;
    this.authService.fetchUnverifiedCentres().subscribe(
      (res) => {
        this.unVerifiedCentres = res;
        this.isGettingCenters = false;
      },
      (err) => {
        this.notification.showNotification(`${err.error.msg}`,'error');
        this.isGettingCenters = false;
      }
    )
  }
  addField(field: 'images' | 'videos' | 'availableInstruments' | 'daysAvailable' | 'procedures' | 'equipments') {
    if (this.exerciseData[field][this.exerciseData[field].length - 1] !== '') {
      this.exerciseData[field].push('');
      setTimeout(() => {
        const inputs = document.querySelectorAll(`input[name=${field}${this.exerciseData[field].length - 1}]`);
        if (inputs.length > 0) {
          (inputs[0] as HTMLInputElement).focus();
        }
      });
    }
  }

  removeField(field: 'images' | 'videos' | 'availableInstruments' | 'daysAvailable' | 'procedures' | 'equipments', index: number) {
    if (this.exerciseData[field].length > 1) {
      this.exerciseData[field].splice(index, 1);
    }
  }
  trackByIndex(index: number, item: any): number {
    return index;
  }
  submitExercise() {
    this.authService.addExercise(this.exerciseData).subscribe(
      (res) => {
      this.notification.showNotification(res.message, 'success');
      this.resetForm();
    }, (error) => {
      this.notification.showNotification(error.err.message, 'error');
    });
  }

  resetForm() {
    this.exerciseData = {
      exerciseName: '',
      exerciseType: '',
      exerciseDuration: '',
      exerciseMuscleGroup: '',
      difficultyLevel: '',
      images: [''],
      videos: [''],
      equipments: [''],
      details: '',
      exerciseCategory: '',
      benefits: '',
      limitations: '',
      procedures: [''],
      precautions: '',
    };
  }
  showExerciseForm(){
    this.isExerciseForm = !this.isExerciseForm;
  }
  showDetails(Id: string) {
    this.isDetails = true;
    this.selectedGym = this.unVerifiedCentres.find(gym => gym._id === Id) || {
      _id: '',
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
    };
  }
  closeDetails() {
    this.isDetails = false;
    this.selectedGym = {
      _id: '',
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
    };
  }
    verifyGym(id : string){
    this.authService.verifyGymCenter(id).subscribe(
      (res) => {
        this.notification.showNotification("Succesfully Verified",'success');
        this.closeDetails();
        this.ngOnInit();
      },
      (err) => {
        this.notification.showNotification(`${err.error.msg}`,'error');
      }
    )
  }
  //Logout User
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
}
