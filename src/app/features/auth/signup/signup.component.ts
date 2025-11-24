import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router,RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  constructor(private authService: AuthService, private router: Router) {}

  async onSignup() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    try {
      await this.authService.signup(this.email, this.password);
      this.router.navigate(['/tasks']);
    } catch (error:any) {
      if(error.code === 'auth/email-already-in-use'){
        this.errorMessage = 'This email is already registered. Please log in.';
      }else if(error.code === 'auth/invalid-email'){
        this.errorMessage = 'The email address is not valid.';
      }else if(error.code === 'auth/weak-password'){
        this.errorMessage = 'The password is too weak. Please choose a stronger password.';
      }else{
        this.errorMessage = 'Signup failed. Please try again later.';
      }
      console.error('Signup error:', error);
    }
  }
}
