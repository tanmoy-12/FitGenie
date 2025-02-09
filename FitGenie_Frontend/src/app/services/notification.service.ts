import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<{message: string, type: string} | null>(null);

  notification$ = this.notificationSubject.asObservable();

  constructor() {}

  // Show notification with message and type ('success' | 'error' | 'info')
  showNotification(message: string, type: string = 'info') {
    this.notificationSubject.next({ message, type });
    // Automatically hide the notification after 5 seconds
    setTimeout(() => {
      this.clearNotification();
    }, 4000);
  }

  // Clear notification
  clearNotification() {
    this.notificationSubject.next(null);
  }
}
