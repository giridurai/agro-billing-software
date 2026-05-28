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
    if (url.includes('homepage')) this.currentPageTitle = 'Agro Dashboard';
    else if (url.includes('quotation')) this.currentPageTitle = 'Quotations';
    else if (url.includes('invoice')) this.currentPageTitle = 'Sales Invoices';
    else if (url.includes('company')) this.currentPageTitle = 'Customers';
    else if (url.includes('iteam')) this.currentPageTitle = 'Products Master';
    else if (url.includes('suppliers')) this.currentPageTitle = 'Suppliers';
    else if (url.includes('purchase-invoice')) this.currentPageTitle = 'Purchase Invoices';
    else if (url.includes('returns')) this.currentPageTitle = 'Returns';
    else if (url.includes('stock-inward')) this.currentPageTitle = 'Stock Inward';
    else if (url.includes('stock-outward')) this.currentPageTitle = 'Stock Outward';
    else if (url.includes('warehouse')) this.currentPageTitle = 'Warehouse Registry';
    else if (url.includes('reports')) this.currentPageTitle = 'Agro Reports';
    else if (url.includes('settings')) this.currentPageTitle = 'System Settings';
    else if (url.includes('User')) this.currentPageTitle = 'User Management';
    else this.currentPageTitle = 'Dashboard';
  }

  logout() {
    // Basic logout logic
    this.router.navigate(['/login']);
  }
}
