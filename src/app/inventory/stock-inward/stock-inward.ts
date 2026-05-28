import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { StockRecord, Item } from '../../models';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

declare var bootstrap: any;

@Component({
  selector: 'app-stock-inward',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-inward.html',
})
export class StockInwardComponent implements OnInit {
  records: StockRecord[] = [];
  products: Item[] = [];
  searchText: string = '';
  recordData: StockRecord = this.resetRecord();

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadRecords();
    this.apiService.getItems().subscribe(data => this.products = data);
  }

  loadRecords() {
    this.apiService.getStockRecords().subscribe({
      next: (data) => (this.records = data.filter(r => r.type === 'Inward')),
      error: (err) => console.error('Failed to load stock records:', err)
    });
  }

  get filteredRecords() {
    return this.records.filter(
      (rec) =>
        rec.product.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  openModal() {
    this.recordData = this.resetRecord();
    const modalEl = document.getElementById('stockInwardModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  closeModal() {
    const modalEl = document.getElementById('stockInwardModal');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  }

  saveRecord(form: any) {
    if (form.valid) {
      const newRec = { ...this.recordData };
      delete (newRec as any).id;

      this.apiService.addStockRecord(newRec).subscribe({
        next: () => {
          this.loadRecords();
          // Update product stock quantity
          const prod = this.products.find(p => p.name === newRec.product);
          if (prod) {
            prod.stockQuantity = (prod.stockQuantity || 0) + newRec.quantity;
            this.apiService.updateItem(prod).subscribe();
          }

          this.notificationService.addNotification(
            'Stock Inward logged',
            `Received ${newRec.quantity} units of ${newRec.product}.`,
            'system'
          );
          Swal.fire('Saved!', 'Stock inward recorded.', 'success');
          this.closeModal();
        },
        error: () => Swal.fire('Error', 'Save failed', 'error')
      });
    }
  }

  deleteRecord(id: number) {
    Swal.fire({
      title: 'Remove entry?',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteStockRecord(id).subscribe({
          next: () => {
            this.loadRecords();
            Swal.fire('Deleted!', 'Entry removed.', 'success');
          }
        });
      }
    });
  }

  private resetRecord(): StockRecord {
    return {
      id: 0,
      product: '',
      quantity: 10,
      date: new Date().toISOString().split('T')[0],
      type: 'Inward',
      notes: ''
    };
  }
}
