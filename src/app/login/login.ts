import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth'; // ✅ Correct import

@Component({
  selector: 'app-login',
  standalone: true, // ✅ standalone component
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html', // ✅ correct file name
  styleUrls: ['./login.css'], // ✅ correct property name
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;
    this.isLoading = true;

    if (this.authService.login(email, password)) {
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/homepage']);
      }, 2000);
    } else {
      this.isLoading = false;
      alert('Invalid email or password!');
    }
  }
}
