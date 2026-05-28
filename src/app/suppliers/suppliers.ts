import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Supplier } from '../models';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';

declare var bootstrap: any;

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.html',
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  selectedSupplier: Supplier | null = null;
  searchText: string = '';
  supplierData: Supplier = this.resetSupplier();

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.apiService.getSuppliers().subscribe({
      next: (data) => (this.suppliers = data),
      error: (err) => console.error('Failed to load suppliers:', err)
    });
  }

  get filteredSuppliers() {
    return this.suppliers.filter(
      (s) =>
        s.supplierName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (s.gstNumber && s.gstNumber.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }

  openSupplierModal() {
    this.selectedSupplier = null;
    this.supplierData = this.resetSupplier();
    const modalEl = document.getElementById('supplierModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  editSupplier(supplier: Supplier) {
    this.selectedSupplier = supplier;
    this.supplierData = { ...supplier };
    const modalEl = document.getElementById('supplierModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  closeSupplierModal() {
    const modalEl = document.getElementById('supplierModal');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  }

  saveSupplier(form: any) {
    if (form.valid) {
      if (this.selectedSupplier) {
        this.apiService.updateSupplier(this.supplierData).subscribe({
          next: () => {
            this.loadSuppliers();
            Swal.fire('Updated!', `${this.supplierData.supplierName} updated.`, 'success');
            this.closeSupplierModal();
          },
          error: () => Swal.fire('Error', 'Update failed', 'error')
        });
      } else {
        const newSupplier = { ...this.supplierData };
        delete (newSupplier as any).id;
        this.apiService.addSupplier(newSupplier).subscribe({
          next: () => {
            this.loadSuppliers();
            this.notificationService.addNotification(
              'Supplier Registered',
              `${this.supplierData.supplierName} has been added to suppliers directory.`,
              'system'
            );
            Swal.fire('Added!', `${this.supplierData.supplierName} added.`, 'success');
            this.closeSupplierModal();
          },
          error: () => Swal.fire('Error', 'Addition failed', 'error')
        });
      }
    }
  }

  deleteSupplier(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Remove this supplier from database?',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteSupplier(id).subscribe({
          next: () => {
            this.loadSuppliers();
            this.notificationService.addNotification(
              'Supplier Removed',
              'A supplier record has been deleted.',
              'system'
            );
            Swal.fire('Deleted!', 'Supplier removed.', 'success');
          },
          error: () => Swal.fire('Error', 'Deletion failed', 'error')
        });
      }
    });
  }

  private resetSupplier(): Supplier {
    return {
      id: 0,
      supplierName: '',
      contactNumber: '',
      address: '',
      gstNumber: ''
    };
  }
}
