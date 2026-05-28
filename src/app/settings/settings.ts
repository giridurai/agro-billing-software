import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent {
  constructor(public themeService: ThemeService) { }

  settingsCards = [
    {
      title: 'Company Settings',
      description: 'Manage company profile, business details, and official logo.',
      icon: 'mdi-office-building-outline',
      color: 'primary'
    },
    {
      title: 'User & Role Management',
      description: 'Add new users, assign roles, and manage access permissions.',
      icon: 'mdi-account-group-outline',
      color: 'success'
    },
    {
      title: 'Invoice Settings',
      description: 'Configure invoice formats, tax rates, and payment terms.',
      icon: 'mdi-cash-register',
      color: 'warning'
    },
    {
      title: 'Quotation Settings',
      description: 'Setup quotation templates, terms, and default notes.',
      icon: 'mdi-file-document-edit-outline',
      color: 'info'
    },
    {
      title: 'Theme & Appearance',
      description: 'Customize colors, typography, and UI preferences.',
      icon: 'mdi-palette-outline',
      color: 'primary'
    },
    {
      title: 'Notification Settings',
      description: 'Configure email alerts, push notifications, and webhooks.',
      icon: 'mdi-bell-ring-outline',
      color: 'danger'
    },
    {
      title: 'Security Settings',
      description: 'Manage passwords, two-factor authentication, and logs.',
      icon: 'mdi-shield-check-outline',
      color: 'success'
    },
    {
      title: 'Backup & Restore',
      description: 'Schedule automated database backups and export data.',
      icon: 'mdi-cloud-upload-outline',
      color: 'info'
    },
    {
      title: 'Report Settings',
      description: 'Define default report layouts and scheduled exports.',
      icon: 'mdi-chart-bar',
      color: 'warning'
    },
    {
      title: 'API & Integrations',
      description: 'Manage API keys and third-party application connections.',
      icon: 'mdi-api',
      color: 'danger'
    }
  ];
}
