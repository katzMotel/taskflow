import {Injectable} from '@angular/core';
@Injectable({
  providedIn: 'root'
})
/// Service for interacting with local storage
// Used for persisting user settings and application state
/// across sessions.
// @Injectable decorator marks this class as available for
// dependency injection throughout the application.
//provideIn root makes it a singleton service, single instance for the entire application.
export class StorageService {
    private readonly STORAGE_PREFIX = 'taskflow_';

    set<T>(key: string, value: T): void{
        try{
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.STORAGE_PREFIX + key, serialized);
        }catch (error){
            console.error('Error saving to localStorage', error);
        }
    }


///Retrieve data from local storage

    get<T>(key: string): T | null{
        try{
            const item = localStorage.getItem(this.STORAGE_PREFIX + key);
            return item ? JSON.parse(item) : null;
        }catch(error){
            console.error('Error reading from localStorage', error);
            return null;
        }
    }
    //Delete specific item from local storage
    remove(key: string): void {
        localStorage.removeItem(this.STORAGE_PREFIX + key);
    }

    //clear all Taskflow data
    clear(): void {
        const keys = Object.keys(localStorage);
        keys.forEach(key =>{
            if(key.startsWith(this.STORAGE_PREFIX)){
                localStorage.removeItem(key);
            }
        });
    }
    //check if a key exists in local storage
    has(key: string): boolean{
        return localStorage.getItem(this.STORAGE_PREFIX + key) !== null;
    }
}