import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class OpenGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    if (token) {
      return true; // Allow access to the page
    }

    this.router.navigate(['/login']); // Redirect to login page if not logged in
    return false; // Deny access to the page
  }
}
