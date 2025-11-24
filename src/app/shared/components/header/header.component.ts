import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Menu, User } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],  // Add these back!
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  Menu = Menu;
  User = User;
  ErrorMessage: string = '';
  user$; 
  isDropdownOpen: boolean = false;
  
  constructor(public authService: AuthService) { 
    this.user$ = this.authService.user$;
  }
  
  ngOnInit() {
    this.user$.subscribe(user => {
      console.log('Current user in header:', user);
    });
  }
  
  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  toggleDropdown() {
    alert('Button clicked!');
    console.log('Dropdown toggled, current state:', this.isDropdownOpen);
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log('New state:', this.isDropdownOpen);
  }

  async logout() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

