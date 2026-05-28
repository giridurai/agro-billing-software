import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { Invoice } from '../models';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit {
  salesTotal: number = 0;
  purchaseTotal: number = 0;
  customerCount: number = 0;
  productCount: number = 0;
  recentSales: Invoice[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    // 1. Total Sales
    this.apiService.getInvoices().subscribe(data => {
      this.salesTotal = data.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
      this.recentSales = data.slice(-4).reverse();
      this.runCounterAnimation('sales-count', this.salesTotal, true);
    });

    // 2. Total Purchase
    this.apiService.getPurchaseInvoices().subscribe(data => {
      this.purchaseTotal = data.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
      this.runCounterAnimation('purchase-count', this.purchaseTotal, true);
    });

    // 3. Customers Count
    this.apiService.getCompanies().subscribe(data => {
      this.customerCount = data.length;
      this.runCounterAnimation('customer-count', this.customerCount);
    });

    // 4. Products Count
    this.apiService.getItems().subscribe(data => {
      this.productCount = data.length;
      this.runCounterAnimation('product-count', this.productCount);
    });
  }

  private runCounterAnimation(id: string, target: number, isCurrency: boolean = false) {
    const el = document.getElementById(id);
    if (!el) return;

    let current = 0;
    const duration = 1500;
    const start = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      current = easedProgress * target;
      
      if (isCurrency) {
        el.textContent = '₹' + Math.floor(current).toLocaleString();
      } else {
        el.textContent = Math.floor(current).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }
}
