import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';
import { Company } from '../models';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';

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
  showForm: boolean = false;
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
        (company.contactNumber && company.contactNumber.includes(this.searchText)) ||
        (company.aadhaar && company.aadhaar.includes(this.searchText))
    );
  }

  openAddForm() {
    this.clearForm();
    this.showForm = true;
  }

  editCompany(company: Company) {
    this.selectedCompany = company;
    this.companyData = { ...company };
    this.showForm = true;
  }

  clearForm() {
    this.selectedCompany = null;
    this.companyData = this.resetCompany();
    this.showForm = false;
  }

  saveCompany(form: any) {
    if (form.valid) {
      if (this.selectedCompany) {
        // Update
        this.apiService.updateCompany(this.companyData).subscribe({
          next: () => {
            this.loadCompanies();
            this.notificationService.addNotification(
              'Customer Updated', 
              `Records for customer ${this.companyData.companyName} have been updated.`,
              'company'
            );
            Swal.fire('Updated!', `Customer record for ${this.companyData.companyName} updated.`, 'success');
            this.clearForm();
          },
          error: () => Swal.fire('Error', 'Update failed', 'error')
        });
      } else {
        // Create
        const newCompany = { ...this.companyData };
        delete (newCompany as any).id;
        this.apiService.addCompany(newCompany).subscribe({
          next: () => {
            this.loadCompanies();
            this.notificationService.addNotification(
              'Customer Registered', 
              `New customer ${this.companyData.companyName} added to registry.`,
              'company'
            );
            Swal.fire('Added!', `Customer ${this.companyData.companyName} successfully added.`, 'success');
            this.clearForm();
          },
          error: () => Swal.fire('Error', 'Addition failed', 'error')
        });
      }
    }
  }

  deleteCompany(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Remove this customer record from the master database?',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteCompany(id).subscribe({
          next: () => {
            this.loadCompanies();
            this.notificationService.addNotification(
              'Customer Removed', 
              'A customer record was deleted from the master database.',
              'company'
            );
            Swal.fire('Deleted!', 'Customer record removed.', 'success');
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
      aadhaar: '',
      creditBalance: 0,
      maxCreditLimit: 25000,
      status: 'Active',
      industryType: 'Farmer',
      billingAddress: '',
      shippingAddress: ''
    };
  }
}
