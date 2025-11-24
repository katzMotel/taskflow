import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
@Component({
  selector: 'app-settings',
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  constructor(private taskService: TaskService,
              private projectService: ProjectService) { }
  exportData(){
    //get all tasks and projects
    //Convert to JSON
    //Download as file
  
    const data = {
      tasks: this.taskService.getAllTasks(),
      projects: this.projectService.getAllProjects(),
      exportedAt: new Date().toISOString()
    }
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);


  }
  importData(event: any) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const data = JSON.parse(content);
      
      // Clear existing data first
      if (confirm('This will replace all existing data. Continue?')) {
        localStorage.clear();
        
        // Import projects first (tasks depend on them)
        if (data.projects && Array.isArray(data.projects)) {
          localStorage.setItem('taskflow_projects', JSON.stringify(data.projects));
        }
        
        // Then import tasks
        if (data.tasks && Array.isArray(data.tasks)) {
          localStorage.setItem('taskflow_tasks', JSON.stringify(data.tasks));
        }
        
        alert('Data imported successfully! Reloading page...');
        window.location.reload(); // Reload to refresh services
      }
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Failed to import data. Please check the file format.');
    }
  };
  
  reader.readAsText(file);
}
  clearAllData(){
    //Show confirmation
    // Clear localStorage
    //Reload app
    if(confirm('Are you sure you want to clear all data? This action cannot be undone.')){
      localStorage.clear();
      alert('All data cleared. The application will now reload.');
      window.location.reload();
    }
  }
}

