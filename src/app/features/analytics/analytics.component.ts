import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import {Chart, ChartData, registerables} from 'chart.js';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { Task } from '../../core/models';
import { Project } from '../../core/models/project.model';

// Register Chart.js components
Chart.register(...registerables);
@Component({
  selector: 'app-analytics',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit {
 tasks: Task[] = [];
 projects: Project[] = []
  totalTasks: number = 0;
  completedTasks: number = 0;
  inProgressTasks: number = 0;
  totalProjects: number = 0;
  avgCompletionTime: number = 0;
  projectTimeChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Total Time Spent (hrs)',
      data: [],
      backgroundColor: '#3B82F6'
    }]
  };
  completionTimeChartData: ChartData<'line'>={
    labels:[],
    datasets:[{
      label: 'Tasks Completed',
      data: [],
      borderColor:'#3B82F6',
      backgroundColor:'#3B82F6',
      tension:0.4
    }]
  };
 constructor(private taskService: TaskService,
             private projectService: ProjectService) {}

 ngOnInit(){
  this.taskService.tasks$.subscribe(tasks => {
    this.tasks = tasks;
    this.calculateStats();
    this.updatePriorityChart();
    this.updateStatusChart();
    this.updateProjectTimeChart();
    this.updateCompletionTimeChart();
  });
  this.projectService.projects$.subscribe(projects => {
    this.projects = projects;
  });
 }
 priorityChartData: ChartData<'bar'> = {
  labels: ['Low', 'Medium', 'High'],
  datasets: [{
    label: 'Number of Tasks',
    data: [0, 0, 0],
    backgroundColor: ['#34D399', '#FBBF24', '#F87171']
  }]
};
statusChartData: ChartData<'pie'> = {
  labels: ['To Do', 'In Progress', 'Done'],
  datasets: [{
    label: 'Task Status Distribution',
    data: [0, 0, 0],
    backgroundColor: ['#3B82F6', '#FBBF24', '#10B981']
  }]
};



 updatePriorityChart() {
  const lowPriorityCount = this.tasks.filter(t => t.priority === 'low').length;
  const mediumPriorityCount = this.tasks.filter(t => t.priority === 'medium').length;
  const highPriorityCount = this.tasks.filter(t => t.priority === 'high').length;
  this.priorityChartData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [{
      label: 'Number of Tasks',
      data: [lowPriorityCount, mediumPriorityCount, highPriorityCount],
      backgroundColor: ['#34D399', '#FBBF24', '#F87171']
    }]
  };
  
 }
 updateStatusChart(){
  const todoCount = this.tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = this.tasks.filter(t => t.status === 'in-progress').length;
  const doneCount = this.tasks.filter(t => t.status === 'done').length;
  this.statusChartData = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [{
      label: 'Task Status Distribution',
      data: [
        todoCount,
        inProgressCount,
        doneCount
      ],
      backgroundColor: ['#3B82F6', '#FBBF24', '#10B981']
    }]
  };
 }
 updateProjectTimeChart() {
  const projectNames = this.projects.map(p => p.name);
  const timeData = this.projects.map(p => {
    const projectTasks = this.tasks.filter(t => t.projectId === p.id);
    const totalMinutes = projectTasks.reduce((sum, t) => t.timeSpent ? sum + t.timeSpent : sum, 0);
    return Math.round(totalMinutes / 60);
  });
  this.projectTimeChartData = {
    labels: projectNames,
    datasets: [{
      label: 'Total Time Spent (hrs)',
      data: timeData,
      backgroundColor: '#3B82F6'
    }]
  };
 }
 updateCompletionTimeChart() {
  const days: string[] = [];
  const counts: number[] = [];
  const today = new Date();
  for (let i = 6; i>= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    const label = date.toLocaleDateString('en-US',{weekday:'short',month:'numeric',day:'numeric'});
    days.push(label);
    const count = this.tasks.filter(t=>{
      if(!t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      return completedDate.toDateString() === date.toDateString();
    }).length;
    counts.push(count);
  }
  this.completionTimeChartData = {
    labels: days,
    datasets: [{
      label: 'Tasks Completed',
      data: counts,
      borderColor:'#3B82F6',
      backgroundColor:'#3B82F6',
      tension:0.4
    }]
  };
  
}
calculateStats(){
  this.totalTasks = this.tasks.length;
  this.completedTasks = this.tasks.filter(t => t.status === 'done').length;
  this.inProgressTasks = this.tasks.filter(t => t.status === 'in-progress').length;
  const completedTasksWithTime = this.tasks.filter(t=> t.status === 'done' && t.timeSpent > 0);
  if(completedTasksWithTime.length > 0){
    const totalTime = completedTasksWithTime.reduce((sum, t) => t.timeSpent ? sum + t.timeSpent : sum, 0);
    this.avgCompletionTime = Math.round(totalTime /completedTasksWithTime.length);
  } else {
    this.avgCompletionTime = 0;
  }
 }
}
