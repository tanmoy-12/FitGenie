import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [NgIf],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  message: string | null = null;
  type: string = 'info'; // Default type

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notification$.subscribe(notification => {
      if (notification) {
        this.message = notification.message;
        this.type = notification.type;
      } else {
        this.message = null; // Clear message when notification is null
        this.type = 'info'; // Reset type to default
      }
    });
  }

  closeNotification(): void {
    this.notificationService.clearNotification();
  }
}
