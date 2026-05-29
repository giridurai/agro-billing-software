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
  showForm: boolean = false;

  invoiceData: PurchaseInvoice = this.resetInvoice();

  // Local Form Controls for Picture Inward Log
  selectedItemName: string = '';
  selectedItemBatch: string = '';
  selectedItemCost: number = 0;
  selectedItemQty: number = 10;
  selectedItemMfg: string = '';
  selectedItemExpiry: string = '';

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

  onProductChange() {
    const prod = this.products.find(p => p.name === this.selectedItemName);
    if (prod) {
      this.selectedItemCost = Math.round(prod.rate * 0.75); // ~75% of sell rate
      this.selectedItemQty = 10;
      this.selectedItemBatch = 'BATCH-' + Math.floor(1000 + Math.random() * 9000);
      this.selectedItemMfg = new Date().toISOString().split('T')[0];
      this.selectedItemExpiry = new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else {
      this.selectedItemCost = 0;
      this.selectedItemQty = 10;
      this.selectedItemBatch = '';
      this.selectedItemMfg = '';
      this.selectedItemExpiry = '';
    }
  }

  openInvoiceModal() {
    this.selectedInvoice = null;
    this.invoiceData = this.resetInvoice();
    this.selectedItemName = '';
    this.selectedItemCost = 0;
    this.selectedItemQty = 10;
    this.selectedItemBatch = '';
    this.showForm = true;
  }

  viewInvoice(invoice: PurchaseInvoice) {
    this.selectedInvoice = invoice;
    const modalEl = document.getElementById('viewPurchaseInvoiceModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  closeInvoiceModal() {
    this.showForm = false;
  }

  addFormLine() {
    if (!this.selectedItemName) {
      Swal.fire('Selection Required', 'Please select a catalog item first.', 'warning');
      return;
    }
    const prod = this.products.find(p => p.name === this.selectedItemName);
    if (!prod) return;

    const baseCost = this.selectedItemQty * this.selectedItemCost;
    const cgstVal = prod.cgst || 0;
    const sgstVal = prod.sgst || 0;
    const tax = (baseCost * (cgstVal + sgstVal)) / 100;
    const totalAmount = baseCost + tax;

    const existing = this.invoiceData.items.find(
      (it: any) => it.name === this.selectedItemName && it.batchNo === this.selectedItemBatch
    );
    if (existing) {
      existing.quantity += this.selectedItemQty;
      const newBase = existing.quantity * existing.rate;
      existing.amount = newBase + (newBase * (existing.cgst + existing.sgst) / 100);
    } else {
      this.invoiceData.items.push({
        name: prod.name,
        quantity: this.selectedItemQty,
        rate: this.selectedItemCost,
        cgst: cgstVal,
        sgst: sgstVal,
        amount: totalAmount,
        batchNo: this.selectedItemBatch,
        expiryDate: this.selectedItemExpiry,
        mfgDate: this.selectedItemMfg
      } as any);
    }

    // Reset inputs
    this.selectedItemName = '';
    this.selectedItemCost = 0;
    this.selectedItemQty = 10;
    this.selectedItemBatch = '';
    this.selectedItemMfg = '';
    this.selectedItemExpiry = '';
    this.calculateTotal();
  }

  removeItem(index: number) {
    this.invoiceData.items.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.invoiceData.amount = this.invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
  }

  getFormSubtotal(): number {
    return this.invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  }

  getFormTax(): number {
    return this.invoiceData.items.reduce(
      (sum, item) => sum + (item.quantity * item.rate * (item.cgst + item.sgst) / 100),
      0
    );
  }

  getFormTotal(): number {
    return this.invoiceData.amount;
  }

  getItemTax(item: any): number {
    return (item.quantity * item.rate * (item.cgst + item.sgst)) / 100;
  }

  saveInvoice(form: any) {
    if (!this.invoiceData.supplierName) {
      Swal.fire('Validation Error', 'Please select a Supplier Vendor.', 'error');
      return;
    }
    if (this.invoiceData.items.length === 0) {
      Swal.fire('Validation Error', 'Please add at least one catalog item.', 'error');
      return;
    }

    this.calculateTotal();
    this.invoiceData.status = 'Paid'; // Default status is Paid (Consigned Inward)

    if (this.selectedInvoice) {
      this.apiService.updatePurchaseInvoice(this.invoiceData).subscribe({
        next: () => {
          this.loadInvoices();
          this.notificationService.addNotification(
            'Purchase Invoice Updated',
            `Purchase Invoice #${this.invoiceData.invoiceNo} has been revised.`,
            'system'
          );
          Swal.fire('Updated!', 'Wholesale bill updated successfully.', 'success');
          this.showForm = false;
        },
        error: () => Swal.fire('Error', 'Update failed', 'error')
      });
    } else {
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
          Swal.fire('Saved!', `Inward bill ${newInvoice.invoiceNo} logged.`, 'success');
          this.showForm = false;
        },
        error: () => Swal.fire('Error', 'Save failed', 'error')
      });
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

  resetTerminal() {
    this.invoiceData = this.resetInvoice();
    this.selectedItemName = '';
    this.selectedItemCost = 0;
    this.selectedItemQty = 10;
    this.selectedItemBatch = '';
    this.selectedItemMfg = '';
    this.selectedItemExpiry = '';
  }

  private resetInvoice(): PurchaseInvoice {
    return {
      id: 0,
      invoiceNo: 'PUR-2026-' + Math.floor(100 + Math.random() * 900),
      supplierName: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 0,
      status: 'Paid',
      items: []
    };
  }
}
