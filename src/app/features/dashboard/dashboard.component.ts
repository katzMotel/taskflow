import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  totalTasks = 0;
  completedTasks= 0;
  inProgressTasks = 0;
  recentTasks: Task[] = [];
  constructor(private taskService: TaskService) {}
  ngOnInit(){
    this.taskService.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.calculateStats();
    });
  }
  calculateStats(){
    this.totalTasks = this.tasks.length;
    this.completedTasks = this.tasks.filter(t => t.status === 'done').length;
    this.inProgressTasks = this.tasks.filter(t => t.status === 'in-progress').length;
    this.recentTasks = this.tasks
      .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0,5);
  }
  
}
