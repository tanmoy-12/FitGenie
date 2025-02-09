import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-centers',
  imports: [NavbarComponent, FooterComponent, NgIf, NgFor, RouterModule],
  templateUrl: './centers.component.html',
  styleUrl: './centers.component.css',
})
export class CentersComponent {
  selectedFilters: Record<string, string | number | string[] | null> = {};

  gyms: any[] = [];
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  cityChecked: boolean = false;
  ratingChecked: boolean = false;
  daysChecked: boolean = false;
  typeChecked: boolean = false;
  isappointmentCard: boolean = false;

  email = localStorage.getItem('email');
  userName = localStorage.getItem('userName');

  centerRating = [
    { value: 5 },
    { value: 4 },
    { value: 3 },
    { value: 2 },
    { value: 1 },
  ];
  centerType = [{ name: 'AC' }, { name: 'Non-AC' }];
  daysAvailable = [
    { name: 'Everyday', value: 'everyday' },
    { name: 'Monday', value: 'mon' },
    { name: 'Tuesday', value: 'tue' },
    { name: 'Wednesday', value: 'wed' },
    { name: 'Thursday', value: 'thu' },
    { name: 'Friday', value: 'fri' },
    { name: 'Saturday', value: 'sat' },
    { name: 'Sunday', value: 'sun' },
  ];
  city = [
    { name: 'Kolkata' },
    { name: 'Mumbai' },
    { name: 'Delhi' },
    { name: 'Chennai' },
    { name: 'Bangalore' },
    { name: 'Hyderabad' },
    { name: 'Pune' },
    { name: 'Mohali' },
    { name: 'Nagpur' },
    { name: 'Jaipur' },
    { name: 'Bhopal' },
    { name: 'Visakhapatnam' },
    { name: 'Vadodara' },
    { name: 'Surat' },
    { name: 'Ahmedabad' },
    { name: 'Rajkot' },
    { name: 'Lucknow' },
    { name: 'Kanpur' },
    { name: 'Nashik' },
    { name: 'Indore' },
    { name: 'Bhubaneswar' },
  ];

  ngOnInit() {
    this.fetchGymCentres();
  }

  toggleCheck(
    check: boolean,
    currentState:
      | 'cityChecked'
      | 'ratingChecked'
      | 'daysChecked'
      | 'typeChecked'
  ): void {
    this[currentState] = !check;
  }
  viewDetails(Id: String){
    this.router.navigate(['/centerDetails/'+Id]);
  }
  fetchGymCentres(): void {
    const filters = Object.keys(this.selectedFilters).reduce(
      (acc: Record<string, string | string[] | null>, key) => {
        if (this.selectedFilters[key] !== null && this.selectedFilters[key] !== undefined) {
          acc[key] = Array.isArray(this.selectedFilters[key])
            ? this.selectedFilters[key] // Keep arrays as they are
            : String(this.selectedFilters[key]); // Convert numbers to strings
        }
        return acc;
      },
      {}
    );
    this.authService.fetchFilteredCenterDetails(filters).subscribe({
      next: (response) => {
        this.gyms = response.gyms || [];
      },
      error: (error) => {
        console.error('Error fetching gyms:', error);
      },
    });
}

  // Handle selection change
  updateFilter(type: string, value: string | number): void {
    if (type === 'rating') {
      this.selectedFilters[type] = String(value); // Convert number to string
    } else if (type === 'daysAvailable') {
      this.selectedFilters[type] = Array.isArray(value) ? value : [String(value)]; // Ensure array format
    } else {
      this.selectedFilters[type] = value ? String(value) : null; // Convert all values to strings
    }
    this.fetchGymCentres();
}

  clearFilters(): void {
    this.selectedFilters = {}; // Reset filters to an empty object
    this.fetchGymCentres();
  }
}
