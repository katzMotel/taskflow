import { Component, Output, EventEmitter } from '@angular/core';
import { LucideAngularModule, Menu, User } from 'lucide-angular';
@Component({
  selector: 'app-header',
  imports: [LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  Menu = Menu;
  User = User;

  onToggleSidebar(){
    this.toggleSidebar.emit();
  }

}
