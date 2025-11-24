import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Observable of the current user
  user$: Observable<any>;

  constructor(private auth: Auth) {
    // Track authentication state
    this.user$ = user(this.auth);
  }

  // Sign up with email/password
  async signup(email: string, password: string) {
    // Use createUserWithEmailAndPassword
    return await createUserWithEmailAndPassword(this.auth, email, password);
  }

  // Login with email/password
  async login(email: string, password: string) {
    // Use signInWithEmailAndPassword
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  // Logout
  async logout() {
    // Use signOut
    return await signOut(this.auth);
  }
  getCurrentUser(){
    return this.user$;
  }
  isLoggedIn(){
    return this.auth.currentUser;
  }
}