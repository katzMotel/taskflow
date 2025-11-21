import { Component, Input,Output ,EventEmitter} from '@angular/core';
import { RouterLink ,RouterLinkActive} from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule ,X, Home, BarChart3, KanbanSquare, CheckSquare, Settings, LucideIconData} from 'lucide-angular';
interface NavLink {
  name: string;
  route: string;
  icon: LucideIconData;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})


export class SidebarComponent {
  X = X;
  
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() isSidebarOpen: boolean = false;
  // an array for sidebar items
  sidebarLinks: NavLink[] = [
    {name: 'Dashboard', route: '/dashboard',icon:Home},
    {name: 'Analytics', route: '/analytics',icon:BarChart3},
    {name: 'Kanban', route: '/kanban',icon:KanbanSquare},
    {name: 'Tasks', route: '/tasks',icon:CheckSquare},
    {name: 'Settings', route: '/settings',icon:Settings}
  ]
  onToggleSidebar(){
    this.toggleSidebar.emit();
  }
}
