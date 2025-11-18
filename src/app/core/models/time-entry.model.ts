export interface TimeEntry{
    id: string;
    taskId: string;
    startTime: Date;
    endTime?: Date;
    duration?: number; // minutes
    note?: string;
}

export interface CreateTimeEntryDto{
    taskId: string;
    note?: string;
}