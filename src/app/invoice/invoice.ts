import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Iteams } from '../iteams';
import { Invoice, InvoiceItem, Item } from '../models';
import { ApiService } from '../services/api.service';

import Swal from 'sweetalert2';
import { RupeeToWordsPipe } from '../pipes/rupee-to-words-pipe';
import { NotificationService } from '../services/notification.service';

declare var bootstrap: any;

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, RupeeToWordsPipe],
  templateUrl: './invoice.html',
  styleUrls: ['./invoice.css'],
})
export class InvoiceComponent implements OnInit {
  items: Item[] = []; // dropdown options from Item Master
  invoices: Invoice[] = [];
  selectedInvoice: Invoice | null = null;
  invoiceData: Invoice = this.getEmptyInvoice();
  searchText: string = '';

  constructor(
    private itemService: Iteams, 
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.apiService.getItems().subscribe(data => this.items = data);
    this.loadInvoices();
  }

  loadInvoices() {
    this.apiService.getInvoices().subscribe({
      next: (data) => (this.invoices = data),
      error: (err) => console.error('Failed to load invoices:', err)
    });
  }

  onItemNameChange(item: InvoiceItem) {
    const master = this.items.find(i => i.name === item.name);
    if (master) {
      item.rate = master.rate;
      item.cgst = master.cgst;
      item.sgst = master.sgst;
      item.hsnCode = master.hsnCode;
      item.discount = master.discount;
      this.recalculateItem(item);
    } else {
      item.rate = 0;
      item.cgst = 0;
      item.sgst = 0;
      item.amount = 0;
      item.hsnCode = '';
      item.discount = 0;
    }
  }

  viewInvoice(invoice: any) {
    this.selectedInvoice = invoice;
    const modalEl = document.getElementById('viewInvoiceModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  get filteredInvoices() {
    const q = this.searchText.toLowerCase();
    return this.invoices.filter(
      (inv) =>
        inv.invoiceNo.toLowerCase().includes(q) ||
        inv.orderNo.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.status.toLowerCase().includes(q)
    );
  }

  private getEmptyInvoice(): Invoice {
    return {
      id: 0,
      invoiceNo: '',
      orderNo: '',
      customerName: '',
      customerGSTIN: '',
      billingAddress: '',
      reverseCharge: 'N',
      state: 'Tamil Nadu',
      stateCode: '33',
      status: 'Pending',
      dueDate: new Date().toISOString().split('T')[0],
      amount: 0,
      balanceDue: 0,
      forwardingCharges: 0,
      packingCharges: 0,
      insuranceCharges: 0,
      gstReverseCharge: 0,
      termsConditions: '1. Goods once sold will not be taken back.\n2. Subject to Chennai Jurisdiction.',
      vehicleNo: '',
      items: [],
    };
  }

  addItem() {
    this.invoiceData.items.push({
      name: '',
      quantity: 1,
      rate: 0,
      cgst: 0,
      sgst: 0,
      hsnCode: '',
      discount: 0,
      taxableValue: 0,
      amount: 0,
    });
  }

  removeItem(index: number) {
    this.invoiceData.items.splice(index, 1);
    this.recalculateTotals();
  }

  recalculateItem(item: InvoiceItem) {
    const base = item.quantity * item.rate;
    const discount = item.discount || 0;
    item.taxableValue = base - discount;
    const cgstAmount = (item.taxableValue * item.cgst) / 100;
    const sgstAmount = (item.taxableValue * item.sgst) / 100;
    item.amount = item.taxableValue + cgstAmount + sgstAmount;
    this.recalculateTotals();
  }

  recalculateTotals() {
    const itemsTotal = this.invoiceData.items.reduce((sum, it) => sum + (it.amount || 0), 0);
    const extraCharges = (this.invoiceData.forwardingCharges || 0) + 
                         (this.invoiceData.packingCharges || 0) + 
                         (this.invoiceData.insuranceCharges || 0);
    this.invoiceData.amount = itemsTotal + extraCharges;
    this.invoiceData.balanceDue = this.invoiceData.amount;
  }

  openInvoiceModal() {
    this.selectedInvoice = null;
    this.invoiceData = this.getEmptyInvoice();
    const modalEl = document.getElementById('invoiceModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  editInvoice(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.invoiceData = JSON.parse(JSON.stringify(invoice));
    const modalEl = document.getElementById('invoiceModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  saveInvoice(form: any) {
    if (form.valid) {
      this.recalculateTotals();
      if (this.selectedInvoice) {
        this.apiService.updateInvoice(this.invoiceData).subscribe({
            next: () => {
                this.loadInvoices();
                this.notificationService.addNotification(
                  'Invoice Updated', 
                  `Invoice #${this.invoiceData.invoiceNo} has been revised.`,
                  'invoice'
                );
                Swal.fire('Updated!', 'Invoice modified.', 'success');
                this.closeInvoiceModal();
            },
            error: () => Swal.fire('Error', 'Update failed', 'error')
        });
      } else {
        const newInvoice = { ...this.invoiceData };
        delete (newInvoice as any).id;
        this.apiService.addInvoice(newInvoice).subscribe({
            next: () => {
                this.loadInvoices();
                this.notificationService.addNotification(
                  'New Invoice Generated', 
                  `Invoice #${this.invoiceData.invoiceNo} for ${this.invoiceData.customerName} created.`,
                  'invoice'
                );
                Swal.fire('Added!', 'New invoice generated.', 'success');
                this.closeInvoiceModal();
            },
            error: () => Swal.fire('Error', 'Addition failed', 'error')
        });
      }
    }
  }

  deleteInvoice(id: number) {
    Swal.fire({
      title: 'Remove this invoice?',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteInvoice(id).subscribe({
            next: () => {
                this.loadInvoices();
                this.notificationService.addNotification(
                  'Invoice Deleted', 
                  'An invoice record has been removed from the system.',
                  'invoice'
                );
                Swal.fire('Deleted!', 'Invoice removed.', 'success');
            },
            error: () => Swal.fire('Error', 'Deletion failed', 'error')
        });
      }
    });
  }

  closeInvoiceModal() {
    ['invoiceModal', 'viewInvoiceModal'].forEach(id => {
      const modalEl = document.getElementById(id);
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
    });
  }

  printInvoice() {
    window.print();
  }

  getItemAmount(item: InvoiceItem): number {
    return item.amount || 0;
  }

  getTotalAmountBeforeDiscount(): number {
    if (!this.selectedInvoice?.items) return 0;
    return this.selectedInvoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  }

  getTotalDiscount(): number {
    if (!this.selectedInvoice?.items) return 0;
    return this.selectedInvoice.items.reduce((sum, item) => sum + (item.discount || 0), 0);
  }

  getTotalBeforeTax(): number {
    if (!this.selectedInvoice?.items) return 0;
    return this.selectedInvoice.items.reduce((sum, item) => sum + (item.taxableValue || 0), 0);
  }

  getTotalCGST(): number {
    if (!this.selectedInvoice?.items) return 0;
    return this.selectedInvoice.items.reduce((sum, item) => sum + ((item.taxableValue || 0) * item.cgst / 100), 0);
  }

  getTotalSGST(): number {
    if (!this.selectedInvoice?.items) return 0;
    return this.selectedInvoice.items.reduce((sum, item) => sum + ((item.taxableValue || 0) * item.sgst / 100), 0);
  }

  getGrandTotal(): number {
    const subtotal = this.getTotalBeforeTax() + this.getTotalCGST() + this.getTotalSGST();
    const extra = (this.selectedInvoice?.forwardingCharges || 0) + 
                    (this.selectedInvoice?.packingCharges || 0) + 
                    (this.selectedInvoice?.insuranceCharges || 0);
    return subtotal + extra;
  }
}
