import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TimeEntry } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './storage.service';
import{TaskService } from './task.service';

// TIME ENTRY SERVICE
// This service will manage time entries for tasks.
// It will provide methods to start, stop, and log time spent on tasks.
// Future enhancements may include reporting and analytics on time usage.
@Injectable({
  providedIn: 'root'
})
export class TimeEntryService {
  // Key for local storage
  private readonly TIME_ENTRIES_KEY = 'time_entries';
  //BehaviorSubject to hold current time entries
  private timeEntriesSubject = new BehaviorSubject<TimeEntry[]>([]);
  
  //Public observable for components to subscribe to
  public timeEntries$ = this.timeEntriesSubject.asObservable();
  constructor(private storageService: StorageService,
    private taskService: TaskService
  ) { 
    this.loadTimeEntries();
  }
  private loadTimeEntries():void{
    const entries = this.storageService.get<TimeEntry[]>(this.TIME_ENTRIES_KEY) || [];
    //Convert date strings back to Date objects
    const parsedEntries = entries.map(entry => ({
      ...entry,
      startTime: new Date(entry.startTime),
      endTime: entry.endTime ? new Date(entry.endTime) : undefined
    }));
    this.timeEntriesSubject.next(parsedEntries);
  }

  private saveTimeEntries(entries: TimeEntry[]):void{
    this.storageService.set(this.TIME_ENTRIES_KEY, entries);
    this.timeEntriesSubject.next(entries);
  }

  // Start a new time entry for a task
  startTimer(taskId: string): TimeEntry {
    const newEntry: TimeEntry = {
      id: uuidv4(),
      taskId,
      startTime: new Date(),
    };
    const entries = [...this.timeEntriesSubject.value, newEntry];
    this.saveTimeEntries(entries);
    return newEntry;
  }

  // Stop the timer for a given time entry
  stopTimer(entryId: string): TimeEntry | null {
  const entries = this.timeEntriesSubject.value;
  const entryIndex = entries.findIndex(e => e.id === entryId);
  
  if (entryIndex === -1) {
    return null; // Entry not found
  }
  
  const entry = entries[entryIndex];
  if (entry.endTime) {
    return null; // Timer already stopped
  }
  
  const endTime = new Date();
  const duration = Math.round((endTime.getTime() - entry.startTime.getTime()) / 1000 / 60); // Minutes
  
  const updatedEntry: TimeEntry = {
    ...entry,
    endTime,
    duration
  };
  
  const updatedEntries = [...entries];
  updatedEntries[entryIndex] = updatedEntry;
  this.saveTimeEntries(updatedEntries);

  // Update the associated task's timeSpent
   const task = this.taskService.getTaskById(entry.taskId);
  if (task) {
    this.taskService.updateTask(entry.taskId, {
      timeSpent: task.timeSpent + duration
    });
  }
  
  return updatedEntry;


}

// Get active timer for a task
getActiveTimer(taskId: string): TimeEntry | null {
  const entries = this.timeEntriesSubject.value;
  const activeEntry = entries.find(e => e.taskId === taskId && !e.endTime);
  return activeEntry || null;
}
// get entries for task
getEntriesForTask(taskId: string): TimeEntry[]{
  return this.timeEntriesSubject.value.filter(e => e.taskId === taskId);
}

}