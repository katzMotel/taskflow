import { Component , OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskPriority } from '../../core/models/task.model';
import { FormsModule } from '@angular/forms';
import { Project } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';
import { LucideAngularModule, Trash2,Edit2 ,PlayCircle, StopCircle} from 'lucide-angular';
import { TimeEntryService } from '../../core/services/time-entry.service';
import { min } from 'rxjs';
@Component({
  selector: 'app-tasks',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent implements OnInit, OnDestroy {
  Trash2 = Trash2;
  Edit2 = Edit2;
  PlayCircle = PlayCircle;
  StopCircle = StopCircle;
  tasks: Task[] = [];
  projects: Project[] = [];
  statusFilter: string = 'all';
  filteredTasks: Task[] = [];
  searchTerm: string = '';
  sortBy: string = 'dueDate';
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  editingTaskId: string |null = null;
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
activeTimers= new Map<string, string>();
private timerInterval: any;

  constructor(private taskService: TaskService, 
              private projectService: ProjectService,
              private timeEntryService: TimeEntryService
  ){}
  ngOnInit(){
    this.taskService.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.applyFilter();
    });
    this.projectService.projects$.subscribe(projects => {
      this.projects = projects;
    });
    this.timerInterval = setInterval(() => {
      // Trigger change detection for elapsed time updates
    }, 60000); // Update every minute
  }
  ngOnDestroy(){
    if(this.timerInterval){
      clearInterval(this.timerInterval);
    }
  }
  //GET PROJECT NAME
  getProjectName(projectId: string): string{
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  }

  //FORMAT TIME
  formatTime(minutes: number): string{
    if(minutes < 60){
      return `${minutes} m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  setFilter(status: string){
    console.log('setFilter called with status:', status);
    this.statusFilter = status;
    console.log('Current statusFilter:', this.statusFilter);
    this.applyFilter();
  }

  applyFilter() {
  console.log('applyFilter called');
  console.log('Total tasks:', this.tasks.length);
  console.log('Current statusFilter:', this.statusFilter);
  let result = this.tasks;
  
  // First filter by status
  if (this.statusFilter !== 'all') {
    result = result.filter(task => task.status === this.statusFilter);
    console.log('After status filter:', result.length);
  }
  // Then filter by search term
  if (this.searchTerm) {
    result = result.filter(task => {
      return task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
             task.description.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
    console.log('After search filter:', result.length);
  }
  
  // Apply sorting and set filtered tasks
  this.filteredTasks = this.applySort(result);
  console.log('Final filtered tasks:', this.filteredTasks.length);
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
  openCreateModal(){
    this.isModalOpen= true;
  }
  
  openEditModal(task:Task){
    this.isEditMode = true;
    this.editingTaskId = task.id;
    this.newTask = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      projectId: task.projectId,
      dueDate: task.dueDate,
      estimatedTime: task.estimatedTime
    };
    this.isModalOpen = true;
  }
  closeModal(){
    this.isEditMode = false;
    this.editingTaskId = null;
    this.isModalOpen = false;
    this.newTask ={
      title: '',
      description: '',
      priority: 'medium',
      projectId: '',
      dueDate: undefined,
      estimatedTime: undefined
    };
  } 
saveTask(){
  // call tasService.createTask with newTask data
  if(!this.isEditMode && this.editingTaskId){
    this.taskService.updateTask(this.editingTaskId, {
      title: this.newTask.title,
      description: this.newTask.description,
      priority: this.newTask.priority,
      projectId: this.newTask.projectId,
      dueDate: this.newTask.dueDate ? new Date(this.newTask.dueDate) : undefined,
      estimatedTime: this.newTask.estimatedTime
  });} else {
    this.taskService.createTask({
      title: this.newTask.title,
      description: this.newTask.description,
      priority: this.newTask.priority,
      projectId: this.newTask.projectId,
      dueDate: this.newTask.dueDate? new Date(this.newTask.dueDate) : undefined,
      estimatedTime: this.newTask.estimatedTime
    });
  }

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
isTimerActive(taskId: string): boolean{
  return this.timeEntryService.getActiveTimer(taskId) !== null;
}
startTimer(taskId: string){
  const entry = this.timeEntryService.startTimer(taskId);
  if(entry){
    this.activeTimers.set(taskId, entry.id);
  }
}
stopTimer(taskId: string){
  const activeEntry = this.timeEntryService.getActiveTimer(taskId);
  if(activeEntry){
    this.timeEntryService.stopTimer(activeEntry.id);
    this.activeTimers.delete(taskId);
  }
}
getElapsedTime(taskId: string): string {
  const entry = this.timeEntryService.getActiveTimer(taskId);
  if (!entry || !entry.startTime) return '';  // Make sure we have a valid active timer
  
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - entry.startTime.getTime()) / 1000 / 60);
  
  if (elapsed < 60) {
    return `${elapsed}m`;
  } else {
    const hours = Math.floor(elapsed / 60);
    const mins = elapsed % 60;
    return `${hours}h ${mins}m`;
  }
}
  }
