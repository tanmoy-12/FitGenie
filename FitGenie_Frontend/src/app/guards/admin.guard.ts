import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): Observable<boolean> {
    const email = localStorage.getItem('email');
    const isAdmin = localStorage.getItem('isAdmin');
    const isFitnessCenter = localStorage.getItem('isFitnessCenter');
    if(isAdmin){
      return of(true); // Allow access if user type is admin
    }
    this.router.navigate(['/']);
    return of(false); // Allow access if user type is
  }
}
