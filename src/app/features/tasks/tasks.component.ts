import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskPriority } from '../../core/models/task.model';
import { FormsModule } from '@angular/forms';
import { Project } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';
import { LucideAngularModule, Trash2 } from 'lucide-angular';
@Component({
  selector: 'app-tasks',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent {
  Trash2 = Trash2;
  tasks: Task[] = [];
  projects: Project[] = [];
  statusFilter: string = 'all';
  filteredTasks: Task[] = [];
  searchTerm: string = '';
  sortBy: string = 'dueDate';
  isModalOpen: boolean = false;
  newTask: {
  title: string;
  description: string;
  priority: TaskPriority;
  projectId: string;
  dueDate?: Date;
  estimatedTime?: number;
} = {
  title: '',
  description: '',
  priority: 'medium',
  projectId: '',
  dueDate: undefined,
  estimatedTime: undefined
};
  constructor(private taskService: TaskService, 
              private projectService: ProjectService
  ){}
  ngOnInit(){
    this.taskService.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.applyFilter();
    });
    this.projectService.projects$.subscribe(projects => {
      this.projects = projects;
    });
  }
 
  setFilter(status: string){
    this.statusFilter = status;
    this.applyFilter();
  }

  applyFilter(){
    let result = this.tasks;
    if(this.statusFilter !== 'all'){
      result = result.filter(task => task.status === this.statusFilter);
    }
    if (this.searchTerm){
      this.filteredTasks = result.filter(task => {
        return task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
               task.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      });
    } else {
      this.filteredTasks = this.tasks.filter(task => task.status === this.statusFilter);
    }
    this.filteredTasks = this.applySort(this.filteredTasks);
  }
  applySort(filteredTasks: Task[]): Task[]{
    let result = [...filteredTasks];
    if(this.sortBy === 'dueDate'){
      result = result.sort((a, b) => {
        if(!a.dueDate) return 1;
        if(!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      });
    }
    if (this.sortBy === 'priority'){
      const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
      result = result.sort((a, b) => {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    }
    if(this.sortBy ==='title'){
      result = result.sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }
  openModal(){
    this.isModalOpen= true;
  }
  closeModal(){
    this.isModalOpen= false;
  }
createTask(){
  // call tasService.createTask with newTask data
  this.taskService.createTask({
    title: this.newTask.title,
    description: this.newTask.description,
    priority: this.newTask.priority,
    projectId: this.newTask.projectId,
    dueDate: this.newTask.dueDate,
    estimatedTime: this.newTask.estimatedTime
  });

  //Close modal
  this.closeModal();

  //Reset newTask
  this.newTask = {
    title: '',
    description: '',
    priority: 'medium',
    projectId: '',
    dueDate: undefined,
    estimatedTime: undefined
  };
}
deleteTask(taskId: string){
  this.taskService.deleteTask(taskId);  
}
}
