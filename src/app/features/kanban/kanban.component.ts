import { Component, OnInit, OnDestroy } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus } from '../../core/models';
import { TimeEntryService } from '../../core/services/time-entry.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, PlayCircle, StopCircle } from 'lucide-angular';
import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-kanban',
  imports: [CommonModule, LucideAngularModule, CdkDropList, CdkDrag],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.css'
})
export class KanbanComponent implements OnInit, OnDestroy {
  PlayCircle = PlayCircle;
  StopCircle = StopCircle;
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];
  private timerInterval: any;
  kanbanColumns = [
    { title: 'To Do', tasks: this.todoTasks, status: 'todo' },
    { title: 'In Progress', tasks: this.inProgressTasks, status: 'in-progress' },
    { title: 'Done', tasks: this.doneTasks, status: 'done' }
  ];
  activeTimers= new Map<string, string>();
  constructor(private taskService: TaskService, private timeEntryService: TimeEntryService) {}
  isTimerActive(taskId: string): boolean {
    return this.timeEntryService.getActiveTimer(taskId) !== null;
  }
  startTimer(taskId: string): void {
    const entry = this.timeEntryService.startTimer(taskId);
    this.activeTimers.set(taskId, entry.id);
  }
  stopTimer(taskId: string): void {
    const entryId = this.activeTimers.get(taskId);
    if (entryId) {
      this.timeEntryService.stopTimer(entryId);
    }
    this.activeTimers.delete(taskId);
  }
  ngOnInit(){
    this.taskService.tasks$.subscribe(tasks => {
      //Filter tasks into three seperate arrays 
      this.todoTasks = tasks.filter(t => t.status === 'todo');
      this.inProgressTasks = tasks.filter(t => t.status === 'in-progress');
      this.doneTasks = tasks.filter(t => t.status === 'done');
      this.kanbanColumns[0].tasks = this.todoTasks;
      this.kanbanColumns[1].tasks = this.inProgressTasks;
      this.kanbanColumns[2].tasks = this.doneTasks;
      this.timerInterval = setInterval(() => {
        // Trigger change detection for elapsed time updates
      }, 60000); // Update every minute
    });
  }
  ngOnDestroy(){
    if(this.timerInterval){
      clearInterval(this.timerInterval);
    }
  }

  onTaskDrop(event: CdkDragDrop<Task[]>, newStatus: string) {
    if(event.previousContainer === event.container){
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      // Get task that was moved
      const movedTask = event.container.data[event.currentIndex];
      //Update task status in the service
      this.taskService.updateTaskStatus(movedTask.id, newStatus as TaskStatus);
    }
  
  }
  getElapsedTime(taskId: string): string {
  const entry = this.timeEntryService.getActiveTimer(taskId);
  if (!entry) return '';
  
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - entry.startTime.getTime()) / 1000 / 60); // minutes
  
  if (elapsed < 60) {
    return `${elapsed}m`;
  } else {
    const hours = Math.floor(elapsed / 60);
    const mins = elapsed % 60;
    return `${hours}h ${mins}m`;
  }
}
}
