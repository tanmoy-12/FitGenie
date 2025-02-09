import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';
import { HttpClient } from '@angular/common/http';

interface Recommendation {
  recommended_workout: string;
  exercise: string;
  session_duration: string;
  accuracy: number;
  calories_burned: number;
  water_intake: number;
}
interface Activity {
  name: string;
  unit: string;
  reductionPerUnit: number; // CO2 reduction per unit
}
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgFor
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent {
  userName = localStorage.getItem('userName');
  email = localStorage.getItem('email');

  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private http = inject(HttpClient);

  loggedIn = false;

  recommendation: any = null;
  loading = false;
  isShowing: boolean = false;

  isbmiLoading: boolean = false;
  showBMIForm: boolean = false;
  isBMILoaded: boolean = false;

  bmiResult: any = null;
  recommendations: Recommendation[] = [];

  isDetails: boolean = false;
  openDetails(){
    this.isDetails = true;
  }
  closeDetails(){
    this.isDetails = false;
  }
  userActivaties: any[] = [];
  userInput: {
    age: number | null;
    gender: string;
    weight: number | null;
    height: number | null;
    avg_bpm: number | null;
    experience_level: number | null;
    workout_frequency: number | null;
    bmi: number;
    medicalCondition?: string;  // Marked as optional
  } = {
    age: null,
    gender: '',
    weight: null,
    height: null,
    avg_bpm: null,
    experience_level: null,
    workout_frequency: null,
    bmi: 0,
  };
  activities: Activity[] = [
    { name: 'Cycling instead of driving', unit: 'km', reductionPerUnit: 0.21 }, // kg CO₂ saved per km
    { name: 'Walking instead of driving', unit: 'km', reductionPerUnit: 0.17 }, // kg CO₂ saved per km
    { name: 'Using public transport', unit: 'km', reductionPerUnit: 0.10 }, // kg CO₂ saved per km
    { name: 'Carpooling', unit: 'km', reductionPerUnit: 0.12 }, // kg CO₂ saved per km
    { name: 'Planting trees', unit: 'trees', reductionPerUnit: 22.0 }, // kg CO₂ saved per tree annually
    { name: 'Using reusable bottles', unit: 'bottles', reductionPerUnit: 0.02 } // kg CO₂ saved per bottle
  ];

  selectedActivity: Activity | null = null;
  quantity: number | null = null;
  logs: { activity: string; quantity: number; reduction: number }[] = [];
  totalReduction = 0;

  ngOnInit(){
    this.fetchActivity();
  }

  fetchActivity(){
    if(this.email){
      this.authService.fetchActivityLogs(this.email).subscribe(
        (logs) => {
          this.userActivaties = logs;
        },
        (error) => {
          console.error('Error fetching activity logs:', error);
        }
      )
    }
  }
  addActivity() {
    if (!this.selectedActivity || !this.quantity || this.quantity <= 0) {
      alert('Please select an activity and enter a valid quantity.');
      return;
    }

    // Calculate CO2 reduction
    const reduction = this.quantity * this.selectedActivity.reductionPerUnit;

    // Add the activity log
    this.logs.push({
      activity: this.selectedActivity.name,
      quantity: this.quantity,
      reduction: reduction
    });

    // Generate a combined text for all logs
    const wholeText = this.logs.map(log =>
      `Activity: ${log.activity}, Quantity: ${log.quantity}, CO2 Saved: ${log.reduction.toFixed(2)} kg`
    ).join('\n');

    // Send the combined data to the server
    if (this.email) {
      this.authService.addActivity(this.email, wholeText).subscribe(
        (res) => {
          this.notification.showNotification(res, 'success');
        },
        (error) => {
          this.notification.showNotification('Failed to log activity. Please try again.', 'error');
          console.error('Error logging activity:', error);
        }
      );
    }

    // Update total reduction and reset input
    this.totalReduction += reduction;
    this.quantity = null;
  }

  /**
   * Fetches workout recommendations based on user input.
   * Excludes medical condition from backend request but uses it in frontend processing.
   */
  getRecommendations(event: Event) {
    event.preventDefault(); // Prevent form reload

    // Validate Inputs
    if (!this.userInput.height || !this.userInput.weight) {
      this.notification.showNotification('Please enter valid height and weight!', 'error');
      return;
    }

    // Calculate BMI
    const heightInMeters = this.userInput.height / 100; // Convert cm to meters
    this.userInput.bmi = parseFloat((this.userInput.weight / (heightInMeters * heightInMeters)).toFixed(2));

    console.log('Final Request Payload:', this.userInput);

    // Create a copy of userInput without medicalCondition before sending to the backend
    const requestData = { ...this.userInput };
    delete requestData.medicalCondition; // Remove medical condition field

    this.loading = true;

    this.authService.getExerciseRecommendations(requestData)
      .subscribe(
        response => {
          this.recommendations = response.recommendations || [];
          this.addDiseaseBasedRecommendations(); // Add manual disease-based suggestions
          console.log('Final Recommendations:', this.recommendations);
          this.loading = false;
          this.isShowing = true;
        },
        error => {
          console.error('Error fetching recommendations', error);
          this.notification.showNotification('Failed to fetch recommendations. Please try again.', 'error');
          this.loading = false;
        }
      );
  }

  /**
   * Adds disease-based recommendations (frontend only).
   */
  addDiseaseBasedRecommendations() {
    // Read user medical condition (only used in frontend logic)
    const userCondition = this.userInput.medicalCondition?.toLowerCase(); // Example: "diabetes"

    if (!userCondition) return; // Skip if no condition is selected

    const diseaseRecommendations: { [key: string]: string[] } = {
      "heart disease": ["Yoga", "Cardio"],
      "diabetes": ["Yoga", "Strength"],
      "hypertension": ["Yoga", "Cardio"],
      "osteoarthritis": ["Yoga", "Strength"],
      "copd": ["Yoga", "Cardio"],
      "diverticulosis": ["Yoga", "HIIT"]
    };

    if (diseaseRecommendations[userCondition]) {
      this.recommendations = this.recommendations.map(rec => {
        if (diseaseRecommendations[userCondition].includes(rec.recommended_workout)) {
          return {
            ...rec,
            recommended_workout: `Recommended for you: ${rec.recommended_workout}`
          };
        }
        return rec;
      });
    }
  }

  /**
   * BMI Calculation using an API.
   */
  bmiCalculate() {
    if (!this.userInput.weight || !this.userInput.height) {
      this.notification.showNotification('Please enter valid weight and height!', 'error');
      return;
    }

    this.isbmiLoading = true;

    this.authService.calculateBmi(this.userInput.weight, this.userInput.height).subscribe(
      response => {
        this.isbmiLoading = false;
        this.bmiResult = response.data.bmi;
        this.isBMILoaded = true;
        this.showBMIForm = true;
      },
      error => {
        this.isbmiLoading = false;
        this.notification.showNotification('BMI calculation failed. Try again later.', 'error');
        console.error('Error:', error);
      }
    );
  }

  /**
   * Logs out the user.
   */
  logout() {
    const email = localStorage.getItem('email');
    if (email) {
      this.authService.logout(email).subscribe(
        (res) => {
          localStorage.clear();
          this.router.navigate(['/login']);
          this.notification.showNotification(`${res.msg}`, 'success');
        },
        (err) => {
          this.notification.showNotification(`${err.error.msg}`, 'error');
        }
      );
    }
  }

  /**
   * Scrolls to a specific section on the page.
   */
  goToSection(section: string) {
    this.router.navigate([''], { fragment: `${section}` });
    if (this.router.url === '/') {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      this.router.navigate(['/']).then(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }
}
