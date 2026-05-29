import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Invoice, Company, StockRecord } from '../models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
})
export class ReportsComponent implements OnInit {
  activeTab: 'sales' | 'gstr1' | 'receivables' | 'stockLedger' = 'sales';

  salesInvoices: Invoice[] = [];
  customers: Company[] = [];
  stockRecords: StockRecord[] = [];

  // Filters
  startDate: string = '';
  endDate: string = '';
  searchText: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadData();
    // Default current month filters
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
  }

  loadData() {
    this.apiService.getInvoices().subscribe(data => this.salesInvoices = data);
    this.apiService.getCompanies().subscribe(data => this.customers = data);
    this.apiService.getStockRecords().subscribe(data => this.stockRecords = data);
  }

  setTab(tab: 'sales' | 'gstr1' | 'receivables' | 'stockLedger') {
    this.activeTab = tab;
    this.searchText = '';
  }

  // 1. Sales Report: Filtered Invoices
  get filteredSalesReport() {
    return this.salesInvoices.filter(inv => {
      const dateMatch = this.checkDateRange(inv.dueDate);
      const textMatch = this.searchText
        ? inv.invoiceNo.toLowerCase().includes(this.searchText.toLowerCase()) ||
          inv.customerName.toLowerCase().includes(this.searchText.toLowerCase())
        : true;
      return dateMatch && textMatch;
    });
  }

  // Computations for Sales Report
  getSalesTaxableValue(inv: Invoice): number {
    return inv.items.reduce((sum, item) => {
      const base = item.quantity * item.rate;
      const discount = item.discount ? base * (item.discount / 100) : 0;
      return sum + (base - discount);
    }, 0);
  }

  getSalesGST(inv: Invoice): number {
    return inv.amount - this.getSalesTaxableValue(inv);
  }

  // 2. GSTR-1 Flattened Line Items
  get gstr1Items() {
    const list: any[] = [];
    this.salesInvoices.forEach(inv => {
      if (!this.checkDateRange(inv.dueDate)) return;
      if (this.searchText && !inv.customerName.toLowerCase().includes(this.searchText.toLowerCase()) && !inv.invoiceNo.toLowerCase().includes(this.searchText.toLowerCase())) {
        return;
      }
      inv.items.forEach(item => {
        const base = item.quantity * item.rate;
        const discount = item.discount ? base * (item.discount / 100) : 0;
        const taxable = base - discount;
        const cgstAmt = taxable * (item.cgst / 100);
        const sgstAmt = taxable * (item.sgst / 100);
        list.push({
          gstin: inv.customerGSTIN || 'Not Applicable',
          details: `${inv.invoiceNo} / ${inv.dueDate}`,
          productName: item.name,
          taxableBase: taxable,
          gstRate: item.cgst + item.sgst,
          cgst: cgstAmt,
          sgst: sgstAmt
        });
      });
    });
    return list;
  }

  // 3. Outstanding Receivables
  get outstandingReceivables() {
    return this.customers.filter(c => {
      const textMatch = this.searchText
        ? c.companyName.toLowerCase().includes(this.searchText.toLowerCase()) ||
          c.contactNumber.includes(this.searchText)
        : true;
      return (c.creditBalance || 0) >= 0 && textMatch;
    });
  }

  // 4. Stock Movement Ledger
  get stockMovementLedger() {
    return this.stockRecords.filter(rec => {
      const dateMatch = this.checkDateRange(rec.date);
      const textMatch = this.searchText ? rec.product.toLowerCase().includes(this.searchText.toLowerCase()) : true;
      return dateMatch && textMatch;
    });
  }

  private checkDateRange(dateStr: string): boolean {
    if (!dateStr) return true;
    if (this.startDate && dateStr < this.startDate) return false;
    if (this.endDate && dateStr > this.endDate) return false;
    return true;
  }

  printReport() {
    window.print();
  }
}
