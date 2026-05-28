import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { PurchaseInvoice, Supplier, Item } from '../models';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';

declare var bootstrap: any;

@Component({
  selector: 'app-purchase-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-invoice.html',
})
export class PurchaseInvoiceComponent implements OnInit {
  invoices: PurchaseInvoice[] = [];
  suppliers: Supplier[] = [];
  products: Item[] = [];
  searchText: string = '';
  selectedInvoice: PurchaseInvoice | null = null;

  invoiceData: PurchaseInvoice = this.resetInvoice();

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadInvoices();
    this.apiService.getSuppliers().subscribe(data => this.suppliers = data);
    this.apiService.getItems().subscribe(data => this.products = data);
  }

  loadInvoices() {
    this.apiService.getPurchaseInvoices().subscribe({
      next: (data) => (this.invoices = data),
      error: (err) => console.error('Failed to load purchase invoices:', err)
    });
  }

  get filteredInvoices() {
    return this.invoices.filter(
      (inv) =>
        inv.invoiceNo.toLowerCase().includes(this.searchText.toLowerCase()) ||
        inv.supplierName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  openInvoiceModal() {
    this.selectedInvoice = null;
    this.invoiceData = this.resetInvoice();
    const modalEl = document.getElementById('purchaseInvoiceModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  viewInvoice(invoice: PurchaseInvoice) {
    this.selectedInvoice = invoice;
    const modalEl = document.getElementById('viewPurchaseInvoiceModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  closeInvoiceModal() {
    const modalEl = document.getElementById('purchaseInvoiceModal');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  }

  addItem() {
    this.invoiceData.items.push({
      name: '',
      quantity: 1,
      rate: 0,
      cgst: 9,
      sgst: 9,
      amount: 0
    });
  }

  removeItem(index: number) {
    this.invoiceData.items.splice(index, 1);
    this.calculateTotal();
  }

  onProductChange(item: any) {
    const prod = this.products.find(p => p.name === item.name);
    if (prod) {
      item.rate = prod.rate;
      item.cgst = prod.cgst;
      item.sgst = prod.sgst;
      this.calculateItemAmount(item);
    }
  }

  calculateItemAmount(item: any) {
    const base = item.quantity * item.rate;
    const tax = (base * (item.cgst + item.sgst)) / 100;
    item.amount = base + tax;
    this.calculateTotal();
  }

  calculateTotal() {
    this.invoiceData.amount = this.invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
  }

  saveInvoice(form: any) {
    if (form.valid && this.invoiceData.items.length > 0) {
      this.calculateTotal();
      const newInvoice = { ...this.invoiceData };
      delete (newInvoice as any).id;

      this.apiService.addPurchaseInvoice(newInvoice).subscribe({
        next: () => {
          this.loadInvoices();
          this.notificationService.addNotification(
            'Purchase Invoice Registered',
            `Purchase invoice ${newInvoice.invoiceNo} registered from ${newInvoice.supplierName}.`,
            'system'
          );
          Swal.fire('Saved!', `Purchase Invoice ${newInvoice.invoiceNo} added.`, 'success');
          this.closeInvoiceModal();
        },
        error: () => Swal.fire('Error', 'Save failed', 'error')
      });
    } else if (this.invoiceData.items.length === 0) {
      Swal.fire('Warning', 'Add at least one line item', 'warning');
    }
  }

  deleteInvoice(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Remove this purchase record?',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deletePurchaseInvoice(id).subscribe({
          next: () => {
            this.loadInvoices();
            Swal.fire('Deleted!', 'Invoice removed.', 'success');
          }
        });
      }
    });
  }

  private resetInvoice(): PurchaseInvoice {
    return {
      id: 0,
      invoiceNo: 'PUR-2026-' + Math.floor(100 + Math.random() * 900),
      supplierName: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 0,
      status: 'Pending',
      items: []
    };
  }
}
