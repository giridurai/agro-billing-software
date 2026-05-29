import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Supplier } from '../models';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.html',
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  searchText: string = '';
  showForm: boolean = false;
  selectedSupplier: Supplier | null = null;
  supplierData: Supplier = this.resetSupplierData();

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.apiService.getSuppliers().subscribe({
      next: (data) => (this.suppliers = data),
      error: (err) => console.error('Failed to load suppliers:', err),
    });
  }

  private resetSupplierData(): Supplier {
    return {
      id: 0,
      supplierName: '',
      contactNumber: '',
      address: '',
      gstNumber: '',
    };
  }

  get filteredSuppliers() {
    return this.suppliers.filter(
      (s) =>
        s.supplierName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        s.gstNumber.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  openAddForm() {
    this.selectedSupplier = null;
    this.supplierData = this.resetSupplierData();
    this.showForm = true;
  }

  editSupplier(supplier: Supplier) {
    this.selectedSupplier = supplier;
    this.supplierData = { ...supplier };
    this.showForm = true;
  }

  clearForm() {
    this.showForm = false;
    this.selectedSupplier = null;
    this.supplierData = this.resetSupplierData();
  }

  saveSupplier(form: any) {
    if (form.valid) {
      if (this.selectedSupplier) {
        this.apiService.updateSupplier(this.supplierData).subscribe({
          next: () => {
            this.loadSuppliers();
            this.notificationService.addNotification(
              'Supplier Updated',
              `Supplier "${this.supplierData.supplierName}" information has been updated.`,
              'system'
            );
            Swal.fire('Updated!', 'Supplier details updated.', 'success');
            this.clearForm();
          },
          error: (err) => Swal.fire('Error', 'Failed to update supplier.', 'error'),
        });
      } else {
        const newSupplier = { ...this.supplierData };
        delete (newSupplier as any).id;
        this.apiService.addSupplier(newSupplier).subscribe({
          next: () => {
            this.loadSuppliers();
            this.notificationService.addNotification(
              'Supplier Registered',
              `Supplier "${this.supplierData.supplierName}" added to the directory.`,
              'system'
            );
            Swal.fire('Registered!', 'New wholesale supplier registered.', 'success');
            this.clearForm();
          },
          error: (err) => Swal.fire('Error', 'Failed to add supplier.', 'error'),
        });
      }
    }
  }

  deleteSupplier(id: number) {
    Swal.fire({
      title: 'Remove this supplier?',
      text: 'This will remove the supplier record from your vendor directory.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteSupplier(id).subscribe({
          next: () => {
            this.loadSuppliers();
            this.notificationService.addNotification(
              'Supplier Removed',
              'A wholesale supplier has been removed.',
              'system'
            );
            Swal.fire('Removed!', 'Supplier record deleted.', 'success');
          },
          error: (err) => Swal.fire('Error', 'Failed to delete supplier.', 'error'),
        });
      }
    });
  }
}
