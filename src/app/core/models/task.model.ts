export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    projectId: string;
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    estimatedTime?: number; // minutes
    timeSpent: number; // minutes
    tags: string[];
}
export interface CreateTaskDto{
    title: string;
    description: string;
    priority: TaskPriority;
    projectId: string;
    dueDate?: Date;
    estimatedTime?: number; 
    tags?: string[];
}

export interface UpdateTaskDto extends Partial<CreateTaskDto>{
   status?: TaskStatus;
   timeSpent?: number;
}

