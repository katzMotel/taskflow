import {Injectable} from '@angular/core';
import { BehaviorSubject, from, Observable  } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Project, CreateProjectDto} from '../models/project.model';
import { StorageService } from './storage.service';

//Project Service
//Manages project-related operations (CRUD).
// Demonstrates same patterns applied to different data entities.

@Injectable({
    providedIn: 'root'
})
export class ProjectService{
    private readonly PROJECTS_KEY = 'projects';

    //BehaviorSubject to hold current projects state
    private projectsSubject = new BehaviorSubject<Project[]>([]);
    
    //Public observable for components to subscribe to
    public projects$ = this.projectsSubject.asObservable();

    constructor(private storageService: StorageService){
        this.loadProjects();
        //ensure at least one default project exists
        this.ensureDefaultProject();
    }
    //Load projects from local storage
    private loadProjects(): void{
        const projects = this.storageService.get<Project[]>(this.PROJECTS_KEY) || [];
        const parsedProjects = projects.map(project => ({
            ...project,
            createdAt: new Date(project.createdAt)
        }));
        this.projectsSubject.next(parsedProjects);
    }
    
    //Save projects to local storage
    private saveProjects(projects: Project[]): void{
        this.storageService.set(this.PROJECTS_KEY, projects);
        this.projectsSubject.next(projects);
    }


    //helper method for default project
    getDefaultProjectId(): string{
        return this.projectsSubject.value[0]?.id || '';
    }
    //ENSURE DEFAULT PROJECT EXISTS
    // new users need at least one project to assign tasks to,
    // This is called when the service initializes.

    private ensureDefaultProject(): void{
        if(this.projectsSubject.value.length ===0){
            this.createProject({
                name: 'Personal',
                color: '#3b82f6',
                description: 'Default personal project'
            });
    }
    }

    //PUBLIC API

    //Get observable of all projects

    getProjects(): Observable<Project[]>{
    return this.projects$;
    }

    //Find project by ID
    getProjectById(id: string): Project | undefined {
    return this.projectsSubject.value.find(project => project.id === id);
    }
    //create New Project

    createProject(dto: CreateProjectDto): Project{
        const newProject: Project = {
            id: uuidv4(),
            name: dto.name,
            color: dto.color,
            description: dto.description,
            createdAt: new Date()
        };

        const projects = [...this.projectsSubject.value, newProject];
        this.saveProjects(projects);
        return newProject;
    }
    //Update existing project

    updateProject(id: string, dto: Partial<CreateProjectDto>): Project | null{
        const projects = this.projectsSubject.value;
        const index = projects.findIndex(project => project.id === id);
        if (index === -1) return null;

        const updatedProject: Project = {
            ...projects[index],
            ...dto
        };
        projects[index] = updatedProject;
        this.saveProjects(projects);
        return updatedProject;
    }
    // Delete project

    deleteProject(id: string): boolean{
        const projects = this.projectsSubject.value.filter(project => project.id !== id);
        //check if any project was removed
        if (projects.length === this.projectsSubject.value.length) return false;
        
        this.saveProjects(projects);
        return true;
    }
    getAllProjects(): Project[]{
        return this.projectsSubject.value;
    }
}