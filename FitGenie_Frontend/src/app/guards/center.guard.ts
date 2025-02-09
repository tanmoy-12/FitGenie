import { CanActivateFn } from '@angular/router';

export const centerGuard: CanActivateFn = (route, state) => {
  const isFitnessCenter = localStorage.getItem('isFitnessCenter');
  if (isFitnessCenter) {
    return true; // Allow access if user type is fitness center
  }
  return false; // Don't Allow access if user type is not fitness center
};
