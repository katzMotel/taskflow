export interface Project{
    id: string;
    name: string;
    color: string;
    description?: string;
    createdAt: Date;
}
export interface CreateProjectDto{
    name: string;
    color: string;
    description?: string;
}
