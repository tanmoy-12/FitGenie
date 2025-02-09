import { CanActivateFn } from '@angular/router';

export const userGuard: CanActivateFn = (route, state) => {
  const email = localStorage.getItem('email');
  if (email) {
    return true; // Allow access if user type is user
  }
  return false; // Don't Allow access if user type is not user
};
