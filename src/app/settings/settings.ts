import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ThemeService } from './theme.service';

export interface SystemSettings {
  firmName: string;
  gstin: string;
  fertilizerLicense: string;
  phone: string;
  email: string;
  address: string;
  financialYear: string;
  roundingMode: string;
  invoicePrefix: string;
  invoiceNextIndex: number;
  quotationPrefix: string;
  quotationNextIndex: number;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  bankBranch: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent implements OnInit {
  settings: SystemSettings = this.getDefaultSettings();

  constructor(public themeService: ThemeService) { }

  ngOnInit() {
    this.loadSettings();
  }

  getDefaultSettings(): SystemSettings {
    return {
      firmName: 'Shree Balaji Agro',
      gstin: '37ABCFG1234F1Z9',
      fertilizerLicense: 'AP-FERT-2026-992',
      phone: '+91 94401 12233',
      email: 'contact@balajiagro.com',
      address: 'Guntur Market Yard, Andhra Pradesh, 522001',
      financialYear: 'F.Y. 2026 - 2027',
      roundingMode: 'Auto Nearest ₹1 (Standard)',
      invoicePrefix: 'INV-26-',
      invoiceNextIndex: 3,
      quotationPrefix: 'QUO-26-',
      quotationNextIndex: 2,
      bankName: 'State Bank of India',
      bankAccount: '38921104112',
      bankIfsc: 'SBIN0001224',
      bankBranch: 'Guntur Yard'
    };
  }

  loadSettings() {
    const data = localStorage.getItem('system_settings');
    if (data) {
      try {
        this.settings = JSON.parse(data);
      } catch (e) {
        this.settings = this.getDefaultSettings();
      }
    } else {
      this.settings = this.getDefaultSettings();
      localStorage.setItem('system_settings', JSON.stringify(this.settings));
    }
  }

  applyConfigurations() {
    localStorage.setItem('system_settings', JSON.stringify(this.settings));
    Swal.fire({
      title: 'Success!',
      text: 'Configurations applied successfully.',
      icon: 'success',
      confirmButtonColor: '#10b981'
    });
  }

  discardChanges() {
    this.loadSettings();
    Swal.fire({
      title: 'Discarded',
      text: 'Changes discarded to last saved configurations.',
      icon: 'info',
      confirmButtonColor: '#6c757d'
    });
  }
}
