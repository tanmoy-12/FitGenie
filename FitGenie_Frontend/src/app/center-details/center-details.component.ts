import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from '../footer/footer.component';
import { NgFor, NgIf } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-center-details',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, NgIf, NgFor],
  templateUrl: './center-details.component.html',
  styleUrl: './center-details.component.css'
})
export class CenterDetailsComponent {
  gymId: string | null = null;
  gymDetails: any = null;
  gymName: string | null = null;
  data: any = null;
  showModelInLargeView: boolean = false;

  email = localStorage.getItem('email');

  showLock: boolean = true;

  showEditPopup: boolean = false;
  editableGymDetails: any = {};
  isWishlisted: boolean = false;

  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);
  private params = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

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
  ngOnInit(): void {
    this.gymId = this.params.snapshot.paramMap.get('id');
    if (this.gymId) {
      this.fetchgymDetails(this.gymId);
    }
    this.editableGymDetails = { ...this.gymDetails };
  }
  openEditForm(): void {
    // Open the popup form and copy the current gym details to an editable object
    this.showEditPopup = true;
    this.editableGymDetails = { ...this.gymDetails };
  }
  saveChanges(): void {
    const updatedDetails = this.editableGymDetails;
    this.loading = true;
    if(this.gymId){
      this.authService.updateGymDetails(this.gymId, updatedDetails).subscribe({
        next: () => {
          this.gymDetails = { ...this.editableGymDetails }; // Update local data
          this.showEditPopup = false;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          alert('Failed to update gym details.');
        }
      });
    }
  }
  wishlist(gymId: string): void {
    if(this.email){
      this.loading = true;
      this.authService.addToWishlist(this.email,gymId).subscribe({
        next: (res) => {
          this.isWishlisted = true;
          this.loading = false;
          this.notificationService.showNotification(res.message, 'success');
        },
        error: (err) => {
          this.loading = false;
          console.log(err);
          this.notificationService.showNotification('Failed to add gym to wishlist.', 'error');
        }
      });
    }
  }
  goToWishlist(){
    this.router.navigate(['/wishList']);
  }
  discardChanges(): void {
    // Close the popup without saving changes
    this.showEditPopup = false;
  }
  addItem(array: any[]) {
    if (Array.isArray(array)) {
      array.push(''); // Adds a new empty item
    }
  }

  removeItem(array: any[], index: number) {
    if (Array.isArray(array) && index >= 0 && index < array.length) {
      array.splice(index, 1); // Removes the specific item
    }
  }

  fetchgymDetails(centerId: string): void {
    this.authService.loadGymDetails(centerId).subscribe({
      next: (data) => {
        this.gymDetails = data.gym;
        this.largeViewType = 'image'
        this.largeViewSrc = this.gymDetails.images[0];
        this.gymName = this.gymDetails.centerName;
        if(this.gymDetails && this.email){
          this.authService.checkInWishlist(this.email, this.gymDetails._id).subscribe(
            (res) => {
              if(res.isGymInWishlist)this.isWishlisted = true;
            },
            (err) => {
              console.log(err);
            }
          )
        }
      },
      error: (err) => console.error('Error fetching gym details:', err),
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
        title: 'Check out this gym!',
        text: 'Here is a detailed view of the gym.',
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
