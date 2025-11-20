import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {v4 as uuidv4} from 'uuid';
import {Task, CreateTaskDto, UpdateTaskDto, TaskStatus} from '../models/task.model';
import {StorageService} from './storage.service';
import {ProjectService} from './project.service';
// TASK SERVICE

// This service manages all task-related operations (CRUD).
// single source of truth for tasks across the application.
// uses RxJs Observables for reactive data flow.
// all data persists to localStorage via StorageService.


@Injectable({
    providedIn: 'root'
})
export class TaskService{

    //key for local storage
    private readonly TASKS_KEY = 'tasks';

    //BehaviorSubject:
    //1. holds current value of tasks
    //2. emits value to subscribers immediately
    //3. emits new values whenever the state changes

    private tasksSubject = new BehaviorSubject<Task[]>([]);

    //public observable for components to subscribe to
    //Components can read from this but cannot modify directly
    public tasks$= this.tasksSubject.asObservable();

    //Constructor
    //Angular's dependency injection provides StorageService instance
    constructor(private storageService: StorageService,private projectService: ProjectService){
        this.loadTasks();
        //if there are no tasks, create sample tasks
        if(this.tasksSubject.value.length === 0){
            this.initializeSampleTasks();
        }
    }
    //Load tasks from local storage on service initialization
    private loadTasks(): void{
        //get tasks from storage (or empty array if none exist)
        const tasks = this.storageService.get<Task[]>(this.TASKS_KEY) || [];
        
        //local storage converts Dates to strings, so we need to convert them back
        //.map() transforms each task in the array
        const parsedTasks = tasks.map(task => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }));
        //update BehaviorSubject with loaded tasks
        // this notifies all subscribers that data is available
        this.tasksSubject.next(parsedTasks);
    }

//SAVE TASKS TO LOCAL STORAGE
    private saveTasks(tasks: Task[]):void{
        //Persist tasks array to local storage
        this.storageService.set(this.TASKS_KEY, tasks);
        //Update BehaviorSubject to notify subscribers of changes
        // This causes UI components to refresh their views
        this.tasksSubject.next(tasks);
    }
    //PUBLIC API METHODS
    //Get the observable that components can subscribe to

    getTasks(): Observable<Task[]>{
        return this.tasks$;
    }
    //Get task by ID
    getTaskById(id: string): Task | undefined{
        return this.tasksSubject.value.find(task => task.id === id);
    }

    // Filter tasks by project ID
    getTasksByProject(projectId: string): Task[]{
        //.filter returns array of tasks matching projectId
        return this.tasksSubject.value.filter(task => task.projectId === projectId);
    }
    // Filter by status
    getTasksByStatus(status: TaskStatus): Task[]{
        return this.tasksSubject.value.filter(task => task.status === status);
    }

    ///CREATE NEW TASK

    createTask(dto: CreateTaskDto): Task{
        const now = new Date();

        //build a complete Task object from the DTO
        const newTask: Task= {
            id: uuidv4(), //generate unique ID
            title: dto.title,
            description: dto.description,
            status: 'todo', //default status
            priority: dto.priority,
            projectId: dto.projectId,
            dueDate: dto.dueDate,
            createdAt: now,
            updatedAt: now,
            estimatedTime: dto.estimatedTime,
            timeSpent: 0, //new tasks start with 0 time spent
            tags: dto.tags || [] // use provided tags or empty array
        };

        //Create new array with existing tasks plus new task
        const tasks = [...this.tasksSubject.value, newTask];
        //Save updated tasks array
        this.saveTasks(tasks);
        // return the newly created task
        return newTask;
    }

    //UPDATE EXISTING TASK
    updateTask(id: string, dto: UpdateTaskDto): Task | null{
        // Get current tasks
        const tasks = this.tasksSubject.value;

        // Find index of task to update
        const index = tasks.findIndex(task => task.id === id);
        if(index === -1) return null; //task not found

        //Merge existing task with updates from DTO to create updated task
        const updatedTask: Task = {
            ...tasks[index],
            ...dto,
            updatedAt: new Date() //set updatedAt to now
        };

        //Replace old task with updated task in array
        tasks[index] = updatedTask;
        //Save updated tasks array
        this.saveTasks(tasks);
        //return updated task
        return updatedTask;

    }

    //DELETE A TASK

    deleteTask(id: string): boolean{
        const tasks = this.tasksSubject.value.filter(task => task.id !== id);

        if(tasks.length === this.tasksSubject.value.length){
            return false; //no task was deleted. ID not found
        }
        

        //Save updated tasks array
        this.saveTasks(tasks);
        return true; //task successfully deleted

    }

    ///UPDATE TASK STATUS
    updateTaskStatus(id: string, status: TaskStatus): Task | null{
        return this.updateTask(id, {status});
    }
    //INITIALIZE SAMPLE TASKS
    private initializeSampleTasks(): void{
        const sampleTasks: CreateTaskDto[] = [
            {
                title: 'Design Landing Page',
                description: 'Create wireframes and mockups for the new landing page.',
                priority: 'high',
                projectId: this.projectService.getDefaultProjectId(),
                dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                estimatedTime: 10,
                tags: ['design', 'frontend']
            },
            {
                title: 'Set Up Database',
                description: 'Install and configure PostgreSQL database for the application.',
                priority: 'medium',
                projectId: 'project-1',
                dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
                estimatedTime: 8,
                tags: ['backend', 'database']
            },
            {
                title: 'Implement Authentication',
                description: 'Add user authentication using JWT tokens.',
                priority: 'high',
                projectId: 'project-2',
                dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
                estimatedTime: 12,
                tags: ['backend', 'security']
            }
        ];

        //Create each sample task
        sampleTasks.forEach(dto => this.createTask(dto));
    }
}