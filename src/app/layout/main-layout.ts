import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';

import { SidebarComponent } from './sidebar';
import { ThemeService } from '../settings/theme.service';
import { NotificationService, Notification } from '../services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, SidebarComponent],
  templateUrl: './main-layout.html',
  styleUrl: '../app.css'
})
export class MainLayoutComponent {
  currentPageTitle: string = 'CRM Dashboard';
  notifications$: Observable<Notification[]>;

  constructor(
    private router: Router, 
    public themeService: ThemeService,
    public notificationService: NotificationService
  ) {
    this.notifications$ = this.notificationService.notifications$;
    this.router.events.subscribe(() => {
      this.updatePageTitle();
    });
  }

  updatePageTitle() {
    const url = this.router.url;
    if (url.includes('homepage')) this.currentPageTitle = 'Home';
    else if (url.includes('enquiry')) this.currentPageTitle = 'Enquiry';
    else if (url.includes('quotation')) this.currentPageTitle = 'Quotation';
    else if (url.includes('invoice')) this.currentPageTitle = 'Invoice';
    else if (url.includes('company')) this.currentPageTitle = 'Company';
    else if (url.includes('iteam')) this.currentPageTitle = 'Item Master';
    else if (url.includes('contact')) this.currentPageTitle = 'Contact';
    else if (url.includes('User')) this.currentPageTitle = 'User Management';
    else this.currentPageTitle = 'Dashboard';
  }

  logout() {
    // Basic logout logic
    this.router.navigate(['/login']);
  }
}
