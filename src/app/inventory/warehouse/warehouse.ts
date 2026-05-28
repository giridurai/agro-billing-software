import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Warehouse } from '../../models';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

declare var bootstrap: any;

@Component({
  selector: 'app-warehouse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './warehouse.html',
})
export class WarehouseComponent implements OnInit {
  warehouses: Warehouse[] = [];
  searchText: string = '';
  warehouseData: Warehouse = this.resetWarehouse();
  selectedWarehouse: Warehouse | null = null;

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.apiService.getWarehouses().subscribe({
      next: (data) => (this.warehouses = data),
      error: (err) => console.error('Failed to load warehouses:', err)
    });
  }

  get filteredWarehouses() {
    return this.warehouses.filter(
      (w) =>
        w.warehouseName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        w.location.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  openModal() {
    this.selectedWarehouse = null;
    this.warehouseData = this.resetWarehouse();
    const modalEl = document.getElementById('warehouseModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  editWarehouse(w: Warehouse) {
    this.selectedWarehouse = w;
    this.warehouseData = { ...w };
    const modalEl = document.getElementById('warehouseModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  closeModal() {
    const modalEl = document.getElementById('warehouseModal');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  }

  saveWarehouse(form: any) {
    if (form.valid) {
      if (this.selectedWarehouse) {
        this.apiService.updateWarehouse(this.warehouseData).subscribe({
          next: () => {
            this.loadWarehouses();
            Swal.fire('Updated!', 'Warehouse records updated.', 'success');
            this.closeModal();
          }
        });
      } else {
        const newW = { ...this.warehouseData };
        delete (newW as any).id;

        this.apiService.addWarehouse(newW).subscribe({
          next: () => {
            this.loadWarehouses();
            this.notificationService.addNotification(
              'Warehouse Registered',
              `New warehouse ${newW.warehouseName} registered at ${newW.location}.`,
              'system'
            );
            Swal.fire('Saved!', 'Warehouse added.', 'success');
            this.closeModal();
          }
        });
      }
    }
  }

  deleteWarehouse(id: number) {
    Swal.fire({
      title: 'Remove warehouse?',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteWarehouse(id).subscribe({
          next: () => {
            this.loadWarehouses();
            Swal.fire('Deleted!', 'Warehouse record removed.', 'success');
          }
        });
      }
    });
  }

  private resetWarehouse(): Warehouse {
    return {
      id: 0,
      warehouseName: '',
      location: '',
      capacity: 5000
    };
  }
}
