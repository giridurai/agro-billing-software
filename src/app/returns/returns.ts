import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ReturnRecord, Item } from '../models';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';

declare var bootstrap: any;

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './returns.html',
})
export class ReturnsComponent implements OnInit {
  returns: ReturnRecord[] = [];
  products: Item[] = [];
  searchText: string = '';
  returnData: ReturnRecord = this.resetReturn();

  reasons: string[] = ['Damaged packaging', 'Expired product', 'Substandard quality', 'Excess quantity shipped', 'Wrong item delivered', 'Other'];

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadReturns();
    this.apiService.getItems().subscribe(data => this.products = data);
  }

  loadReturns() {
    this.apiService.getReturns().subscribe({
      next: (data) => (this.returns = data),
      error: (err) => console.error('Failed to load returns:', err)
    });
  }

  get filteredReturns() {
    return this.returns.filter(
      (ret) =>
        ret.returnNumber.toLowerCase().includes(this.searchText.toLowerCase()) ||
        ret.product.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  openReturnModal() {
    this.returnData = this.resetReturn();
    const modalEl = document.getElementById('returnModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  closeReturnModal() {
    const modalEl = document.getElementById('returnModal');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  }

  saveReturn(form: any) {
    if (form.valid) {
      const newRet = { ...this.returnData };
      delete (newRet as any).id;

      this.apiService.addReturn(newRet).subscribe({
        next: () => {
          this.loadReturns();
          this.notificationService.addNotification(
            'Product Return Registered',
            `Product return ${newRet.returnNumber} has been logged for ${newRet.product}.`,
            'system'
          );
          Swal.fire('Saved!', `Return ${newRet.returnNumber} logged successfully.`, 'success');
          this.closeReturnModal();
        },
        error: () => Swal.fire('Error', 'Save failed', 'error')
      });
    }
  }

  deleteReturn(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Remove this return entry?',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteReturn(id).subscribe({
          next: () => {
            this.loadReturns();
            Swal.fire('Deleted!', 'Return record removed.', 'success');
          }
        });
      }
    });
  }

  private resetReturn(): ReturnRecord {
    return {
      id: 0,
      returnNumber: 'RET-' + Math.floor(100 + Math.random() * 900),
      product: '',
      quantity: 1,
      reason: 'Damaged packaging',
      date: new Date().toISOString().split('T')[0]
    };
  }
}
