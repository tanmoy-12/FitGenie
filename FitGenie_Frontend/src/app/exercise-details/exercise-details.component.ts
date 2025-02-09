import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from '../footer/footer.component';
import { NgFor, NgIf } from '@angular/common';
import { NotificationService } from '../services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ExerciseDetectionComponent } from '../exercise-detection/exercise-detection.component';


@Component({
  selector: 'app-exercise-details',
  imports: [NavbarComponent, FooterComponent, NgIf, NgFor, RouterLink],
  templateUrl: './exercise-details.component.html',
  styleUrl: './exercise-details.component.css'
})
export class ExerciseDetailsComponent {
    exerciseId: string | null = null;
    exerciseDetails: any = null;
    exerciseName: string | null = null;
    data: any = null;
    showModelInLargeView: boolean = false;

    email = localStorage.getItem('email');

    showLock: boolean = true;


    private sanitizer = inject(DomSanitizer);
    private authService = inject(AuthService);
    private params = inject(ActivatedRoute);
    private router = inject(Router);
    private notificationService = inject(NotificationService);
    private dialog= inject(MatDialog);

    //Parameters to display images, videos & 3D models in larger view
    largeViewSrc!: SafeResourceUrl;
    proxyUrl!: string;
    largeViewType: string = '';
    showCommentModal: boolean = false;
    commentText: string = '';

    //Parameter to share page
    currentPageUrl: string;
    loading: boolean = false;
    isModel: boolean = true;

    constructor(private route: ActivatedRoute) {
      this.currentPageUrl = `${window.location.origin}${this.router.url}`;
    }
    openExerciseModal() {
      this.dialog.open(ExerciseDetectionComponent, {
        width: '800px',
        height: '600px',
        panelClass: 'custom-dialog-container'
      });
    }

    ngOnInit(): void {
      this.exerciseId = this.params.snapshot.paramMap.get('id');
      if (this.exerciseId) {
        this.fetchExerciseDetails(this.exerciseId);
      }
    }
    goToWishlist(){
      this.router.navigate(['/wishList']);
    }

    fetchExerciseDetails(exerciseId: string): void {
      this.authService.findExerciseById(exerciseId).subscribe({
        next: (data) => {
          this.exerciseDetails = data;
          this.largeViewType = 'image'
          this.largeViewSrc = this.exerciseDetails.images[0];
          this.exerciseName = this.exerciseDetails.exerciseName;
        },
        error: (err) => console.error('Error fetching exercise details:', err),
      });
    }
    sanitizeUrl(url: string): SafeResourceUrl {
      // Return sanitized URL for non-YouTube videos
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    showInLargeView(src: string, type: string) {
      if(type === 'video' || type === 'image'){
        this.isModel = false;
      }
      else{
        this.isModel = true;
      }
      if(type === 'video'){
        this.largeViewSrc = this.sanitizeUrl(src);
        console.log(this.largeViewSrc);
        this.largeViewType = type;
        return;
      }
      this.largeViewSrc = src;
      this.largeViewType = type;
    }
    sharePage() {
      if (navigator.share) {
        // Use Web Share API
        navigator.share({
          title: 'Check out this exercise!',
          text: 'Here is a detailed view of the exercise.',
          url: this.currentPageUrl,
        })
        .then(() => console.log('Successfully shared'))
        .catch((error) => console.error('Error sharing:', error));
      } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(this.currentPageUrl)
          .then(() => alert('Link copied to clipboard!'))
          .catch((error) => console.error('Error copying link:', error));
      }
    }
}
