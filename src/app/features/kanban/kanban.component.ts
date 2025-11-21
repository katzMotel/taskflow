import { Component } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus } from '../../core/models';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-kanban',
  imports: [CommonModule, LucideAngularModule, CdkDropList, CdkDrag],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.css'
})
export class KanbanComponent {
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];
  kanbanColumns = [
    { title: 'To Do', tasks: this.todoTasks, status: 'todo' },
    { title: 'In Progress', tasks: this.inProgressTasks, status: 'in-progress' },
    { title: 'Done', tasks: this.doneTasks, status: 'done' }
  ];
  constructor(private taskService: TaskService) {}

  ngOnInit(){
    this.taskService.tasks$.subscribe(tasks => {
      //Filter tasks into three seperate arrays 
      this.todoTasks = tasks.filter(t => t.status === 'todo');
      this.inProgressTasks = tasks.filter(t => t.status === 'in-progress');
      this.doneTasks = tasks.filter(t => t.status === 'done');
      this.kanbanColumns[0].tasks = this.todoTasks;
      this.kanbanColumns[1].tasks = this.inProgressTasks;
      this.kanbanColumns[2].tasks = this.doneTasks;
    });
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
}
