import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'taskflow_theme';
  private isDark = false;

  constructor() {
    // Load saved theme or check system preference
    this.loadTheme();
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    
    if (savedTheme) {
      // Use saved preference
      this.isDark = savedTheme === 'dark';
    } else {
      // Check system preference
      this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    this.applyTheme();
  }

  private applyTheme(): void {
    if (this.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    localStorage.setItem(this.THEME_KEY, this.isDark ? 'dark' : 'light');
    this.applyTheme();
  }

  isDarkMode(): boolean {
    return this.isDark;
  }
}