import { FooterComponent } from './../footer/footer.component';
import { Component, inject } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { NgClass, NgIf, NgFor } from '@angular/common';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule, NgIf, NgClass, NgFor, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loading = false;
  otpSent = false;
  loginForm !: FormGroup;
  userName: string = '';

  roles=[
    { value: 'fitness_center', name: 'Fitness Center' },
    { value: 'admin', name: 'Admin' },
    { value: 'user', name: 'User' }
  ]

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private notification: NotificationService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      userType: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if(this.loginForm.invalid) return;
    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe(
      (res) => {
        if (res.error) {
          this.notification.showNotification(`${res.msg}`, 'error');
          this.loading = false;
        } else {
          this.loading = false;

            localStorage.setItem('email', this.loginForm.value.email);

            if (this.loginForm.value.email) {
              this.authService.getUserName(this.loginForm.value.email).subscribe(
                (res) => {
                  this.userName = res.name;
                  localStorage.setItem('userName', this.userName);
                }
              )
            }
            localStorage.setItem('userId', res.userId);
            if (res.isAdmin) {
              localStorage.setItem('token', res.token);
              localStorage.setItem('isAdmin', res.isAdmin.toString());
              this.router.navigate(['/']);
            }else if (res.isFitnessCenter){
              localStorage.setItem('token', res.token);
              localStorage.setItem('isFitnessCenter', res.isFitnessCenter.toString());
              this.router.navigate(['/']);
            }
            else {
              localStorage.setItem('token', res.token);
              this.router.navigate(['/']);
            }

            this.notification.showNotification(`${res.msg}`, 'success');
        }
      },(err) => {
        this.loading = false;
        this.notification.showNotification(err.error, 'error')
      }
    )
  }
}
