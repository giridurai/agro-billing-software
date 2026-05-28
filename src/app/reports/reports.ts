import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Invoice, PurchaseInvoice, Item, StockRecord } from '../models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
})
export class ReportsComponent implements OnInit {
  activeTab: 'sales' | 'purchase' | 'inventory' | 'audit' = 'sales';

  // Raw data arrays
  salesInvoices: Invoice[] = [];
  purchaseInvoices: PurchaseInvoice[] = [];
  products: Item[] = [];
  stockRecords: StockRecord[] = [];

  // Filter Models
  startDate: string = '';
  endDate: string = '';
  filterCategory: string = '';
  filterStatus: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadData();
    // Default: current month filters
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
  }

  loadData() {
    this.apiService.getInvoices().subscribe(data => this.salesInvoices = data);
    this.apiService.getPurchaseInvoices().subscribe(data => this.purchaseInvoices = data);
    this.apiService.getItems().subscribe(data => this.products = data);
    this.apiService.getStockRecords().subscribe(data => this.stockRecords = data);
  }

  setTab(tab: 'sales' | 'purchase' | 'inventory' | 'audit') {
    this.activeTab = tab;
    // reset other filters except date
    this.filterCategory = '';
    this.filterStatus = '';
  }

  // Filtered Lists
  get filteredSales() {
    return this.salesInvoices.filter(inv => {
      // Due Date or mock transaction date (since we don't have a transactionDate, we check dueDate alignment or let it match)
      const dateMatch = this.checkDateRange(inv.dueDate);
      const statusMatch = this.filterStatus ? inv.status === this.filterStatus : true;
      return dateMatch && statusMatch;
    });
  }

  get filteredPurchases() {
    return this.purchaseInvoices.filter(inv => {
      const dateMatch = this.checkDateRange(inv.invoiceDate);
      const statusMatch = this.filterStatus ? inv.status === this.filterStatus : true;
      return dateMatch && statusMatch;
    });
  }

  get filteredInventory() {
    return this.products.filter(p => {
      return this.filterCategory ? p.category === this.filterCategory : true;
    });
  }

  get filteredAudit() {
    return this.stockRecords.filter(rec => {
      const dateMatch = this.checkDateRange(rec.date);
      return dateMatch;
    });
  }

  private checkDateRange(dateStr: string): boolean {
    if (!dateStr) return true;
    if (this.startDate && dateStr < this.startDate) return false;
    if (this.endDate && dateStr > this.endDate) return false;
    return true;
  }

  // Summary Computations
  get totalSalesAmount() {
    return this.filteredSales.reduce((sum, inv) => sum + inv.amount, 0);
  }

  get totalPurchasesAmount() {
    return this.filteredPurchases.reduce((sum, inv) => sum + inv.amount, 0);
  }

  printReport() {
    window.print();
  }
}
