import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink} from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/tasks']);
    } catch (error:any) {
      if(error.code === 'auth/invalid-credential'){
        this.errorMessage = 'Invalid credentials. Please check your email and password.';
      }else if(error.code === 'auth/user-not-found'){
        this.errorMessage = 'No account found with this email.';
      }else if(error.code === 'auth/wrong-password'){
        this.errorMessage = 'Incorrect password. Please try again.';
      }else{
        this.errorMessage = 'Login failed. Please try again later.';
      }
      console.error('Login error:', error);
    }
  }
}
