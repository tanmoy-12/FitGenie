import { Component, inject } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exercises',
  imports: [NavbarComponent, FooterComponent, NgIf, NgFor],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.css'
})
export class ExercisesComponent {
  exercises: any[] = [];

  loading: boolean = false;

  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  ngOnInit(): void {
    this.fetchExercises();
  }

  fetchExercises(){
    this.loading = true;
    this.authService.fetchExercises().subscribe(
      (res) => {
        this.exercises = res;
        this.loading = false;
      },
      (err) => {
        this.notification.showNotification('Failed to fetch exercises', 'error');
        this.loading = false;
      }
    )
  }

  viewDetails(Id: String){
    this.router.navigate(['/exerciseDetails/'+Id]);
  }
}
