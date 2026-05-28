import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme: 'light' | 'dark' = 'light';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
      this.renderer.setAttribute(document.body, 'data-theme', 'dark');
    } else {
      this.renderer.removeAttribute(document.body, 'data-theme');
    }
  }

  getTheme() {
    return this.currentTheme;
  }

  toggleTheme() {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }
}
