import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, NgClass, NgIf, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotPasswordForm!: FormGroup;
  otpForm!: FormGroup;
  passwordForm!: FormGroup;
  step = 1;
  loading = false;
  email: string = '';

  private notificationService= inject(NotificationService);
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    // Step 1: Enter email
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    // Step 2: Verify OTP
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });

    // Step 3: Reset Password
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    }, { validator: this.checkPasswords });
  }

  // Custom validator to check if passwords match
  checkPasswords(group: FormGroup) {
    const pass = group.controls['password'].value;
    const confirmPass = group.controls['confirmPassword'].value;
    return pass === confirmPass ? null : { notSame: true };
  }

  // Step 1: Send OTP
  onSubmitEmail() {
    if (this.forgotPasswordForm.invalid) return;
    this.loading = true;
    this.authService.sendOtp(this.forgotPasswordForm.value.email).subscribe(
      (res) => {
        this.loading = false;
        this.email = this.forgotPasswordForm.value.email;
        this.step = 2; // Move to OTP verification
        this.notificationService.showNotification(`${res.msg}`,'success');
      },
      (err) => {
        this.loading = false;
        this.notificationService.showNotification(`${err.error.msg}`, 'error');
      }
    );
  }

  // Step 2: Verify OTP
  onSubmitOtp() {
    if (this.otpForm.invalid) return;
    this.loading = true;
    this.authService.verifyForgotPasswordOtp(this.email, this.otpForm.value.otp).subscribe(
      (res) => {
        this.loading = false;
        this.step = 3; // Move to password reset
        this.notificationService.showNotification(`${res.msg}`,'success');
      },
      (err) => {
        this.loading = false;
        this.notificationService.showNotification(`${err.error.msg}`, 'error');
      }
    );
  }

  // Step 3: Reset Password
  onSubmitPassword() {
    if (this.passwordForm.invalid) return;
    this.loading = true;
    const { password } = this.passwordForm.value;
    this.authService.resetPassword(this.email, password).subscribe(
      (res) => {
        this.loading = false;
        this.notificationService.showNotification(`${res.msg}`,'success');
        this.router.navigate(['/login']);
      },
      (err) => {
        this.loading = false;
        this.notificationService.showNotification(`${err.error.msg}`, 'error');
      }
    );
  }
}
