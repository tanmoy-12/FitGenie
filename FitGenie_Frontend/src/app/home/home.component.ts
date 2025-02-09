import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from "../footer/footer.component";
import { RouterLink, Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, NgFor, FooterComponent, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  public router = inject(Router);

  email = localStorage.getItem('email');
  userName = localStorage.getItem('userName');
  isAdmin = localStorage.getItem('isAdmin');
  isFitnessCenter = localStorage.getItem('isFitnessCenter');
  getStarted() {
    if(!this.email){
      this.router.navigate(['/login']);
    }
    else if(this.isAdmin){
      this.router.navigate(['/admin']);
    }
    else if(this.isFitnessCenter){
      this.router.navigate(['/center']);
    }
    else{
      this.router.navigate(['/user']);
    }
  }

  features = [
    { text1: '98%', text2: 'Satisfied Users' },
    { text1: '500+', text2: 'Registered Clubs' },
    { text1: '2500+', text2: 'Members'}
  ]

  services = [
    {
      title: 'Customized Training Programs',
      description: 'Personal trainers create tailored programs based on your goals.',
      icon: 'fa fa-dumbbell'
    },
    {
      title: 'Personalized Nutrition',
      description: 'Certified nutritionists offer guidance to meet your fitness objectives.',
      icon: 'fa-solid fa-weight-hanging'
    },
    {
      title: 'Flexible Scheduling',
      description: 'Schedule appointments to suit your needs.',
      icon: 'fa fa-calendar-alt'
    },
    {
      title: 'Step-by-Step Training',
      description: 'Training sessions tailored to ensure an effective fitness journey.',
      icon: 'fa fa-running'
    },
  ]


}
