import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit {
  contactCount: number = 0;
  companyCount: number = 0;
  enquiryCount: number = 0;
  revenue: number = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    // Fetch live counts from ApiService
    this.apiService.getContacts().subscribe(data => {
      this.contactCount = data.length;
      this.runCounterAnimation('contact-count', this.contactCount);
    });

    this.apiService.getCompanies().subscribe(data => {
      this.companyCount = data.length;
      this.runCounterAnimation('company-count', this.companyCount);
    });

    this.apiService.getQuotations().subscribe(data => {
      this.enquiryCount = data.length;
      this.runCounterAnimation('enquiry-count', this.enquiryCount);
    });

    this.apiService.getInvoices().subscribe(data => {
      this.revenue = data.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
      this.runCounterAnimation('revenue-count', this.revenue, true);
    });
  }

  private runCounterAnimation(id: string, target: number, isCurrency: boolean = false) {
    const el = document.getElementById(id);
    if (!el) return;

    let current = 0;
    const duration = 2000; // 2 seconds for a premium feel
    const start = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth Easing (Out-Expo)
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
