import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { Invoice, InvoiceItem, Item, Company } from '../models';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';
import { RupeeToWordsPipe } from '../pipes/rupee-to-words-pipe';

declare var bootstrap: any;

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, RupeeToWordsPipe],
  templateUrl: './invoice.html',
  styleUrl: './invoice.css',
})
export class InvoiceComponent implements OnInit {
  invoices: Invoice[] = [];
  items: Item[] = [];
  customers: Company[] = [];
  searchText: string = '';
  selectedInvoice: Invoice | null = null;
  invoiceData: Invoice = this.getBlankInvoice();

  // Terminal entry helpers
  showTerminal: boolean = false;
  selectedCustomerId: number = 0;
  selectedProductId: number = 0;
  paymentMethod: string = 'Cash Sale';
  tempBatch: string = '';
  tempPrice: number = 0;
  tempQty: number = 1;

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadInvoices();
    this.loadCatalogItems();
    this.loadCustomers();
  }

  loadInvoices() {
    this.apiService.getInvoices().subscribe({
      next: (data) => (this.invoices = data),
      error: (err) => console.error('Failed to load invoices:', err),
    });
  }

  loadCatalogItems() {
    this.apiService.getItems().subscribe({
      next: (data) => (this.items = data),
      error: (err) => console.error('Failed to load catalog items:', err),
    });
  }

  loadCustomers() {
    this.apiService.getCompanies().subscribe({
      next: (data) => (this.customers = data),
      error: (err) => console.error('Failed to load customers:', err),
    });
  }

  generateInvoiceNo(): string {
    const data = localStorage.getItem('system_settings');
    if (data) {
      try {
        const settings = JSON.parse(data);
        const prefix = settings.invoicePrefix || 'INV-26-';
        const nextIndex = settings.invoiceNextIndex || (this.invoices.length + 1);
        return `${prefix}${nextIndex}`;
      } catch (e) { }
    }
    const yearSuffix = new Date().getFullYear().toString().slice(-2);
    const nextSeq = this.invoices.length + 1;
    const seqStr = nextSeq.toString().padStart(4, '0');
    return `INV-${yearSuffix}-${seqStr}`;
  }

  getBlankInvoice(): Invoice {
    return {
      id: 0,
      invoiceNo: 'INV-NEW',
      orderNo: '',
      customerName: '',
      customerGSTIN: '',
      billingAddress: '',
      reverseCharge: 'N',
      status: 'Paid',
      dueDate: new Date().toISOString().split('T')[0],
      amount: 0,
      balanceDue: 0,
      vehicleNo: '',
      forwardingCharges: 0,
      packingCharges: 0,
      insuranceCharges: 0,
      items: [],
    };
  }

  get filteredInvoices() {
    return this.invoices.filter(
      (inv) =>
        inv.invoiceNo.toLowerCase().includes(this.searchText.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (inv.orderNo || '').toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // ─── Terminal Actions ───────────────────────────────
  openTerminal() {
    this.showTerminal = true;
    this.selectedInvoice = null;
    this.invoiceData = this.getBlankInvoice();
    this.invoiceData.invoiceNo = this.generateInvoiceNo();
    this.invoiceData.dueDate = new Date().toISOString().split('T')[0];
    this.selectedCustomerId = 0;
    this.selectedProductId = 0;
    this.paymentMethod = 'Cash Sale';
    this.tempBatch = '';
    this.tempPrice = 0;
    this.tempQty = 1;
  }

  closeTerminal() {
    this.showTerminal = false;
    this.selectedInvoice = null;
  }

  onCustomerChange() {
    const cust = this.customers.find((c) => c.id === +this.selectedCustomerId);
    if (cust) {
      this.invoiceData.customerName = cust.companyName;
      this.invoiceData.customerGSTIN = cust.gst || '';
      this.invoiceData.billingAddress = cust.billingAddress || '';
    } else {
      this.invoiceData.customerName = '';
      this.invoiceData.customerGSTIN = '';
      this.invoiceData.billingAddress = '';
    }
  }

  getCustomerLabel(): string {
    const cust = this.customers.find((c) => c.id === +this.selectedCustomerId);
    if (!cust) return '';
    const credit = (cust.creditBalance || 0) > 0 ? 'Credit' : 'Cash';
    return `${cust.companyName} (${credit} outstanding)`;
  }

  onProductChange() {
    const matched = this.items.find((it) => it.id === +this.selectedProductId);
    if (matched) {
      this.tempPrice = matched.rate || 0;
      this.tempBatch = this.getProductBatch(matched);
    } else {
      this.tempPrice = 0;
      this.tempBatch = '';
    }
  }

  getProductBatch(item: Item): string {
    const batchMap: Record<number, string> = {
      1: 'UR-2026A',
      2: 'DP-8812',
      3: 'MN-9922',
      4: 'NM-002',
      5: 'SW-404',
    };
    return batchMap[item.id] || 'BATCH-2026';
  }

  addLineItem() {
    const matched = this.items.find((it) => it.id === +this.selectedProductId);
    if (!matched) {
      Swal.fire('Select Product', 'Please choose a product first.', 'warning');
      return;
    }
    if (this.tempQty <= 0) {
      Swal.fire('Invalid Qty', 'Quantity must be at least 1.', 'warning');
      return;
    }

    const baseVal = this.tempQty * this.tempPrice;
    const discountVal = (baseVal * (matched.discount || 0)) / 100;
    const taxableVal = baseVal - discountVal;
    const cgstVal = (taxableVal * (matched.cgst || 0)) / 100;
    const sgstVal = (taxableVal * (matched.sgst || 0)) / 100;
    const totalAmt = taxableVal + cgstVal + sgstVal;

    const lineItem: InvoiceItem = {
      name: matched.name,
      quantity: this.tempQty,
      rate: this.tempPrice,
      cgst: matched.cgst || 0,
      sgst: matched.sgst || 0,
      discount: matched.discount || 0,
      taxableValue: taxableVal,
      amount: totalAmt,
      hsnCode: matched.hsnCode || '',
    };

    this.invoiceData.items.push(lineItem);
    this.recalculateTotals();

    // Reset product selectors
    this.selectedProductId = 0;
    this.tempBatch = '';
    this.tempPrice = 0;
    this.tempQty = 1;
  }

  removeItem(index: number) {
    this.invoiceData.items.splice(index, 1);
    this.recalculateTotals();
  }

  recalculateTotals() {
    let subtotal = 0;
    this.invoiceData.items.forEach((item) => {
      subtotal += item.amount || 0;
    });
    this.invoiceData.amount = subtotal;
    this.invoiceData.balanceDue =
      this.invoiceData.status === 'Paid' ? 0 : this.invoiceData.amount;
  }

  getSubtotalBase(): number {
    return this.invoiceData.items.reduce(
      (acc, item) => acc + (item.taxableValue || 0),
      0
    );
  }

  getCGSTTotal(): number {
    return this.invoiceData.items.reduce(
      (acc, item) =>
        acc + ((item.taxableValue || 0) * (item.cgst || 0)) / 100,
      0
    );
  }

  getSGSTTotal(): number {
    return this.invoiceData.items.reduce(
      (acc, item) =>
        acc + ((item.taxableValue || 0) * (item.sgst || 0)) / 100,
      0
    );
  }

  resetTerminal() {
    this.invoiceData = this.getBlankInvoice();
    this.invoiceData.invoiceNo = this.generateInvoiceNo();
    this.invoiceData.dueDate = new Date().toISOString().split('T')[0];
    this.selectedCustomerId = 0;
    this.selectedProductId = 0;
    this.paymentMethod = 'Cash Sale';
    this.tempBatch = '';
    this.tempPrice = 0;
    this.tempQty = 1;
  }

  saveAndPrintInvoice() {
    if (!this.invoiceData.customerName) {
      Swal.fire('Error', 'Please select a Farmer / Dealer Customer.', 'error');
      return;
    }
    if (this.invoiceData.items.length === 0) {
      Swal.fire('Error', 'Please add at least one product line item.', 'error');
      return;
    }

    this.invoiceData.status = this.paymentMethod === 'Cash Sale' ? 'Paid' : 'Pending';
    this.recalculateTotals();

    const newInvoice = { ...this.invoiceData };
    delete (newInvoice as any).id;

    this.apiService.addInvoice(newInvoice).subscribe({
      next: (saved) => {
        const data = localStorage.getItem('system_settings');
        if (data) {
          try {
            const settings = JSON.parse(data);
            if (settings.invoiceNextIndex) {
              settings.invoiceNextIndex = +settings.invoiceNextIndex + 1;
              localStorage.setItem('system_settings', JSON.stringify(settings));
            }
          } catch (e) { }
        }
        this.loadInvoices();
        this.notificationService.addNotification(
          'New Invoice Created',
          `Tax invoice #${this.invoiceData.invoiceNo} successfully registered.`,
          'system'
        );
        Swal.fire({
          title: 'Invoice Saved!',
          text: `Invoice #${this.invoiceData.invoiceNo} created successfully.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
        this.resetTerminal();
      },
      error: () => Swal.fire('Error', 'Failed to save invoice.', 'error'),
    });
  }

  // ─── Registry Actions ──────────────────────────────
  editInvoiceFromRegistry(invoice: Invoice) {
    this.showTerminal = true;
    this.selectedInvoice = invoice;
    this.invoiceData = JSON.parse(JSON.stringify(invoice));
    const foundCust = this.customers.find(
      (c) => c.companyName === invoice.customerName
    );
    this.selectedCustomerId = foundCust ? foundCust.id : 0;
    this.paymentMethod = invoice.status === 'Paid' ? 'Cash Sale' : 'Credit';
  }

  deleteInvoice(id: number) {
    Swal.fire({
      title: 'Delete Invoice?',
      text: 'Are you sure you want to delete this invoice?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteInvoice(id).subscribe({
          next: () => {
            this.loadInvoices();
            this.notificationService.addNotification(
              'Invoice Removed',
              'A sales invoice has been deleted.',
              'system'
            );
            Swal.fire('Deleted!', 'Invoice has been removed.', 'success');
          },
          error: () => Swal.fire('Error', 'Deletion failed.', 'error'),
        });
      }
    });
  }

  viewInvoice(invoice: Invoice) {
    this.selectedInvoice = invoice;
    const modal = document.getElementById('viewInvoiceModal');
    if (modal) {
      bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }

  closeViewModal() {
    const modal = document.getElementById('viewInvoiceModal');
    if (modal) {
      bootstrap.Modal.getOrCreateInstance(modal).hide();
    }
  }

  // ─── Print Preview Helpers ─────────────────────────
  getTotalAmountBeforeDiscount(): number {
    const data = this.selectedInvoice || this.invoiceData;
    return (data.items || []).reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.rate || 0),
      0
    );
  }

  getTotalDiscount(): number {
    const data = this.selectedInvoice || this.invoiceData;
    return (data.items || []).reduce((acc, item) => {
      const baseVal = (item.quantity || 0) * (item.rate || 0);
      return acc + (baseVal * (item.discount || 0)) / 100;
    }, 0);
  }

  getTotalBeforeTax(): number {
    const data = this.selectedInvoice || this.invoiceData;
    return (data.items || []).reduce(
      (acc, item) => acc + (item.taxableValue || 0),
      0
    );
  }

  getTotalCGST(): number {
    const data = this.selectedInvoice || this.invoiceData;
    return (data.items || []).reduce(
      (acc, item) =>
        acc + ((item.taxableValue || 0) * (item.cgst || 0)) / 100,
      0
    );
  }

  getTotalSGST(): number {
    const data = this.selectedInvoice || this.invoiceData;
    return (data.items || []).reduce(
      (acc, item) =>
        acc + ((item.taxableValue || 0) * (item.sgst || 0)) / 100,
      0
    );
  }

  printInvoice() {
    const printContents = document.getElementById('printSection')?.innerHTML;
    if (printContents) {
      const popupWin = window.open('', '_blank', 'width=900,height=990');
      popupWin!.document.open();
      popupWin!.document.write(`
        <html>
          <head>
            <title>Tax Invoice - Puvilink AGRO</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; background: #fff; }
              .invoice-print-area { width: 100%; margin: 0 auto; background: #fff; }
              .clearfix::after { content: ""; clear: both; display: table; }
              .print-header { border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 15px; }
              .print-logo-box { float: left; width: 20%; }
              .print-company-center { float: left; width: 50%; text-align: center; }
              .print-contact-right { float: right; width: 30%; text-align: right; font-size: 11px; color: #374151; line-height: 1.4; }
              .print-title-box { background: #059669; color: #fff; font-size: 16px; font-weight: bold; text-align: center; padding: 5px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
              .invoice-grid { border: 2px solid #059669; margin-bottom: 15px; display: table; width: 100%; }
              .grid-col-left { display: table-cell; width: 50%; border-right: 2px solid #059669; vertical-align: top; }
              .grid-col-right { display: table-cell; width: 50%; vertical-align: top; }
              .grid-row { border-bottom: 1px solid #059669; display: flex; padding: 4px 8px; font-size: 11px; }
              .grid-row:last-child { border-bottom: 0; }
              .label-cell { width: 120px; font-weight: bold; color: #374151; }
              .value-cell { flex-grow: 1; }
              .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
              .invoice-table th, .invoice-table td { border: 1px solid #059669; padding: 6px 8px; font-size: 11px; }
              .invoice-table th { background: #f3f4f6; font-weight: bold; text-align: center; color: #059669; }
              .invoice-table td.text-end { text-align: right; }
              .invoice-table td.text-center { text-align: center; }
              .total-row td { font-weight: bold; background: #f9fafb; }
              .row { display: flex; flex-wrap: wrap; }
              .col-7 { width: 58.3333%; }
              .col-5 { width: 41.6666%; }
              .col-12 { width: 100%; }
              .border { border: 2px solid #059669; }
              .footer-row { display: flex; border-bottom: 1px solid #059669; font-size: 11px; }
              .footer-row:last-child { border-bottom: 0; }
              .footer-label { width: 65%; font-weight: bold; padding: 4px 8px; background: #f9fafb; }
              .footer-value { width: 35%; text-align: right; padding: 4px 8px; font-weight: bold; }
              .fw-bold { font-weight: bold; }
              .fw-extrabold { font-weight: 800; }
              .text-end { text-align: right; }
              .text-center { text-align: center; }
              .fst-italic { font-style: italic; }
              .text-capitalize { text-transform: capitalize; }
            </style>
          </head>
          <body onload="window.print();window.close()">
            <div class="invoice-print-area">${printContents}</div>
          </body>
        </html>
      `);
      popupWin!.document.close();
    }
  }
}
