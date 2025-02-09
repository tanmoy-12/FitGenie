import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { ElementRef } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { NgClass, NgIf } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [NavbarComponent, NgIf, NgClass, ReactiveFormsModule, FooterComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  loading = false;
  otpSent = false;
  signupForm!: FormGroup;
  showPasswordRules: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService,
  ){
    this.signupForm = this.fb.group({
      userName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(16),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[#@$!%*?&])[A-Za-z\\d#@$!%*?&].{8,16}$')
      ]],
      confirmPassword: ['', [Validators.required]],
      userType: ['', [Validators.required]],
      otp: ['']
    }, { validator: this.passwordMatchValidator });
  }

  // Password match validation
  passwordMatchValidator(formGroup: FormGroup) {
    return formGroup.get('password')?.value === formGroup.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  onSubmit() {
    if (!this.otpSent) {
      if (this.signupForm.invalid) return;

      this.loading = true;
      this.authService.signup(this.signupForm.value).subscribe(
        (res) => {
          if (res.error) {
            this.loading = false;
            this.notification.showNotification(res.msg, 'error');
            return;
          }
          this.loading = false;
          this.otpSent = true;
          this.notification.showNotification(res.msg, 'success');
        },
        (err) => {
          this.loading = false;
          this.notification.showNotification(err.error?.msg || 'Signup failed. Please try again.', 'error');
        }
      );
    } else {
      this.loading = true;
      this.authService.verifyOtp(this.signupForm.value).subscribe(
        (res) => {
          this.loading = false;
          if (res.error) {
            this.notification.showNotification(res.msg, 'error');
            return;
          }
          this.router.navigate(['login']);
          this.notification.showNotification(res.msg, 'success');
        },
        (err) => {
          this.loading = false;
          this.notification.showNotification(err.error?.msg || 'OTP verification failed. Please try again.', 'error');
        }
      );
    }
  }

  async signUpWithGoogle() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userData = {
        name: user.displayName,
        email: user.email,
        verificationType: 'google',
      };

      this.authService.googleSignup(userData).subscribe(
        (res) => {
          if (res.error) {
            this.notification.showNotification(res.msg, 'error');
          } else {
            this.router.navigate(['/dashboard']);
            this.notification.showNotification('Signup Successful!', 'success');
          }
        },
        (err) => {
          this.notification.showNotification(err.error?.msg || 'Signup failed', 'error');
        }
      );
    } catch (error) {
      console.error('Google Signup Error:', error);
      this.notification.showNotification('Google Signup failed', 'error');
    }
  }
  // Helper functions to check password validity
  isValidPasswordLength(): boolean {
    const password = this.signupForm.get('password')?.value;
    return password && password.length >= 8 && password.length <= 16;
  }

  containsNumber(): boolean {
    const password = this.signupForm.get('password')?.value;
    return /\d/.test(password);
  }

  containsUpperCase(): boolean {
    const password = this.signupForm.get('password')?.value;
    return /[A-Z]/.test(password);
  }

  containsLowerCase(): boolean {
    const password = this.signupForm.get('password')?.value;
    return /[a-z]/.test(password);
  }

  containsSpecialCharacter(): boolean {
    const password = this.signupForm.get('password')?.value;
    return /[#@$!%*?&]/.test(password);
  }

  togglePasswordRules(): boolean {
    return (this.containsLowerCase() && this.containsSpecialCharacter() && this.containsUpperCase() && this.containsNumber());
  }
}
