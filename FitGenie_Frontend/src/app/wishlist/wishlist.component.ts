import { Component, inject } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-wishlist',
  imports: [NavbarComponent, FooterComponent, NgIf, NgFor, RouterModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent {
  gyms: any[] = [];

  private email = localStorage.getItem('email');

  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit() {
    this.fetchGymCentres();
  }
  fetchGymCentres() {
    if(this.email){
      this.authService.fetchWishlistItems(this.email).subscribe(
        (res) => {
          this.gyms = res;
          console.log(res)
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }
  removeFromWishlist(gymId: string) {
    // Call API to remove gym from wishlist
    //...
    // Update this.gyms array accordingly
  }
  viewDetails(Id: String){
    this.router.navigate(['/centerDetails/'+Id]);
  }

}
