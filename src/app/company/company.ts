import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';
import { Company } from '../models';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';

declare var bootstrap: any;

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company.html',
  styleUrls: ['./company.css'],
})
export class CompanyComponent implements OnInit {
  companies: Company[] = [];
  selectedCompany: Company | null = null;
  searchText: string = '';
  companyData: Company = this.resetCompany();

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.apiService.getCompanies().subscribe({
      next: (data) => (this.companies = data),
      error: (err) => console.error('Failed to load companies:', err)
    });
  }

  get filteredCompanies() {
    return this.companies.filter(
      (company) =>
        company.companyName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        company.contactPerson.toLowerCase().includes(this.searchText.toLowerCase()) ||
        company.email.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  openCompanyModal() {
    this.selectedCompany = null;
    this.companyData = this.resetCompany();
    const modalEl = document.getElementById('companyModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  editCompany(company: Company) {
    this.selectedCompany = company;
    this.companyData = { ...company };
    const modalEl = document.getElementById('companyModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  closeCompanyModal() {
    const modalEl = document.getElementById('companyModal');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  }

  saveCompany(form: any) {
    if (form.valid) {
      if (this.selectedCompany) {
        // Update on server
        this.apiService.updateCompany(this.companyData).subscribe({
            next: () => {
                this.loadCompanies();
                Swal.fire('Updated!', `${this.companyData.companyName} updated.`, 'success');
                this.closeCompanyModal();
            },
            error: () => Swal.fire('Error', 'Update failed', 'error')
        });
      } else {
        // Add on server
        const newCompany = { ...this.companyData };
        delete (newCompany as any).id;
        this.apiService.addCompany(newCompany).subscribe({
            next: () => {
                this.loadCompanies();
                this.notificationService.addNotification(
                  'Company Created', 
                  `${this.companyData.companyName} has been added to the system.`,
                  'company'
                );
                Swal.fire('Added!', `${this.companyData.companyName} added.`, 'success');
                this.closeCompanyModal();
            },
            error: () => Swal.fire('Error', 'Addition failed', 'error')
        });
      }
    }
  }

  deleteCompany(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Deletion is permanent!',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteCompany(id).subscribe({
            next: () => {
                this.loadCompanies();
                this.notificationService.addNotification(
                  'Company Removed', 
                  'A company record has been deleted from the database.',
                  'company'
                );
                Swal.fire('Deleted!', 'Company removed.', 'success');
            },
            error: () => Swal.fire('Error', 'Deletion failed', 'error')
        });
      }
    });
  }

  private resetCompany(): Company {
    return {
      id: 0,
      companyName: '',
      pan: '',
      gst: '',
      contactNumber: '',
      email: '',
      contactPerson: '',
    };
  }
}
