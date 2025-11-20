import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';
import { BaseChartDirective } from 'ng2-charts';
// Import Chart.js core and all chart types/elements
import { Chart, ChartData, registerables } from 'chart.js';

// Register all Chart.js components (charts, scales, elements, plugins)
// This tells Chart.js what types of charts are available
// Without this, Chart.js doesn't know how to render doughnut, bar, line, etc.
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  totalTasks = 0;
  completedTasks = 0;
  inProgressTasks = 0;
  recentTasks: Task[] = [];
  
  // Initialize with valid empty structure so template doesn't error
  // The type ChartData<'doughnut'> tells TypeScript this is doughnut chart data
  progressChartData: ChartData<'doughnut'> = {
    labels: [],           // Will be filled in calculateStats()
    datasets: [{
      data: [],           // Will be filled in calculateStats()
      backgroundColor: [] // Will be filled in calculateStats()
    }]
  };

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    // Subscribe to tasks Observable
    // Whenever tasks change, this runs
    this.taskService.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.calculateStats();  // Recalculate stats and update chart
    });
  }

  calculateStats() {
    // Calculate task counts
    this.totalTasks = this.tasks.length;
    this.completedTasks = this.tasks.filter(t => t.status === 'done').length;
    this.inProgressTasks = this.tasks.filter(t => t.status === 'in-progress').length;
    
    // Get 5 most recent tasks
    // .slice() creates a copy so we don't mutate the original array
    this.recentTasks = this.tasks
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
    
    // Calculate todo count (tasks that aren't done or in progress)
    const todoCount = this.totalTasks - this.completedTasks - this.inProgressTasks;
    
    // Update chart data
    // This will automatically update the chart in the template
    this.progressChartData = {
      labels: ['To Do', 'In Progress', 'Done'],
      datasets: [{
        label: 'Task Progress',
        data: [todoCount, this.inProgressTasks, this.completedTasks],
        backgroundColor: [
          '#f44336',  // Red for To Do
          '#ff9800',  // Orange for In Progress  
          '#4caf50'   // Green for Done
        ],
        hoverOffset: 4  // How much the slice moves out when you hover
      }]
    };
  }
}

