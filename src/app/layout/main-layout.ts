import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, Event, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

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
  isLoading: boolean = false;

  constructor(
    private router: Router,
    public themeService: ThemeService,
    public notificationService: NotificationService
  ) {
    this.notifications$ = this.notificationService.notifications$;
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      }
      this.updatePageTitle();
    });
  }

  updatePageTitle() {
    const url = this.router.url;
    if (url.includes('homepage')) this.currentPageTitle = 'Dashboard';
    else if (url.includes('quotation')) this.currentPageTitle = 'Quotations';
    else if (url.includes('invoice')) this.currentPageTitle = 'Invoices (Sales)';
    else if (url.includes('purchase-invoice')) this.currentPageTitle = 'Purchase Bills';
    else if (url.includes('stock-management')) this.currentPageTitle = 'Stock Management';
    else if (url.includes('iteam')) this.currentPageTitle = 'Product Master';
    else if (url.includes('company')) this.currentPageTitle = 'Customer Master';
    else if (url.includes('suppliers')) this.currentPageTitle = 'Vendor Master';
    else if (url.includes('reports')) this.currentPageTitle = 'Reports';
    else if (url.includes('settings')) this.currentPageTitle = 'System Settings';
    else if (url.includes('User')) this.currentPageTitle = 'User Management';
    else this.currentPageTitle = 'Dashboard';
  }

  logout() {
    // Basic logout logic
    this.router.navigate(['/login']);
  }
}
