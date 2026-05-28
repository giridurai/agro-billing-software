import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Quotation, QuotationItem, Item } from '../models';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';
import Swal from 'sweetalert2';
import { RupeeToWordsPipe } from '../pipes/rupee-to-words-pipe';

declare var bootstrap: any;

@Component({
  selector: 'app-quotation',
  standalone: true,
  imports: [CommonModule, FormsModule, RupeeToWordsPipe],
  templateUrl: './quotation.html',
  styleUrls: ['./quotation.css'],
})
export class QuotationComponent implements OnInit {
  termsConditions: string = '';
  vehicleNo: string = '';
  forwardingCharges: string = '';
  packingCharges: string = '';
  insuranceCharges: string = '';
  gstReverseCharge: string = '';
  toAddress: string = '';

  items: Item[] = []; 
  quotations: Quotation[] = [];
  selectedQuotation: Quotation | null = null;
  quotationData: Quotation = this.resetQuotation();
  searchText: string = '';

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.apiService.getItems().subscribe(data => this.items = data);
    this.loadQuotations();
  }

  loadQuotations() {
    this.apiService.getQuotations().subscribe({
      next: (data) => (this.quotations = data),
      error: (err) => console.error('Failed to load quotations:', err)
    });
  }

  onItemNameChange(item: QuotationItem) {
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

  viewQuotation(quotation: Quotation): void {
    this.selectedQuotation = quotation;
    const modalElement = document.getElementById('viewQuotationModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  get filteredQuotations() {
    return this.quotations.filter(
      (quotation) =>
        quotation.quotationNo.toLowerCase().includes(this.searchText.toLowerCase()) ||
        quotation.companyName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        quotation.contact.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  openQuotationModal() {
    this.selectedQuotation = null;
    this.quotationData = this.resetQuotation();
    const modal = document.getElementById('quotationModal');
    if (modal) (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
  }

  editQuotation(quotation: Quotation) {
    this.selectedQuotation = quotation;
    this.quotationData = JSON.parse(JSON.stringify(quotation));
    const modal = document.getElementById('quotationModal');
    if (modal) (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
  }

  closeQuotationModal() {
    ['quotationModal', 'viewQuotationModal'].forEach(id => {
      const modalEl = document.getElementById(id);
      if (modalEl) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
    });
  }

  saveQuotation(form: any) {
    if (form.valid) {
      this.recalculateTotals();
      if (this.selectedQuotation) {
        // Update on server
        this.apiService.updateQuotation(this.quotationData).subscribe({
            next: () => {
                this.loadQuotations();
                this.notificationService.addNotification(
                  'Quotation Updated', 
                  `Quotation #${this.quotationData.quotationNo} has been modified.`,
                  'quotation'
                );
                Swal.fire('Updated!', 'Quotation modified.', 'success');
                this.closeQuotationModal();
            },
            error: () => Swal.fire('Error', 'Update failed', 'error')
        });
      } else {
        // Add on server
        const newQuotation = { ...this.quotationData };
        delete (newQuotation as any).id;
        this.apiService.addQuotation(newQuotation).subscribe({
            next: () => {
                this.loadQuotations();
                this.notificationService.addNotification(
                  'New Quotation Created', 
                  `Quotation #${this.quotationData.quotationNo} generated for ${this.quotationData.companyName}.`,
                  'quotation'
                );
                Swal.fire('Added!', 'New quotation created.', 'success');
                this.closeQuotationModal();
            },
            error: () => Swal.fire('Error', 'Addition failed', 'error')
        });
      }
    }
  }

  deleteQuotation(id: number) {
    Swal.fire({
      title: 'Remove this quotation?',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteQuotation(id).subscribe({
            next: () => {
                this.loadQuotations();
                this.notificationService.addNotification(
                  'Quotation Deleted', 
                  'A quotation has been removed from the records.',
                  'quotation'
                );
                Swal.fire('Deleted!', 'Quotation removed.', 'success');
            },
            error: () => Swal.fire('Error', 'Deletion failed', 'error')
        });
      }
    });
  }

  private resetQuotation(): Quotation {
    return {
      id: 0,
      quotationNo: '',
      referenceNo: '',
      companyName: '',
      contact: '',
      quotationDate: '',
      expiryDate: '',
      termsconditions: '',
      lineitems: [],
      status: 'Pending',
      amount: 0,
      iteams: [],
    };
  }

  addItem() {
    this.quotationData.iteams.push({
      name: '',
      quantity: 1,
      rate: 0,
      cgst: 0,
      sgst: 0,
      hsnCode: '',
      discount: 0,
      amount: 0,
    });
  }

  removeItem(index: number) {
    this.quotationData.iteams.splice(index, 1);
    this.recalculateTotals();
  }

  recalculateItem(item: QuotationItem) {
    const base = item.quantity * item.rate;
    const discount = item.discount || 0;
    const taxable = base - discount;
    const cgstAmount = (taxable * item.cgst) / 100;
    const sgstAmount = (taxable * item.sgst) / 100;
    item.amount = taxable + cgstAmount + sgstAmount;
    this.recalculateTotals();
  }

  recalculateTotals() {
    this.quotationData.amount = this.quotationData.iteams.reduce((sum, it) => sum + it.amount, 0);
  }

  printQuotation(): void {
    window.print();
  }

  getItemAmount(item: QuotationItem): number {
    const baseAmount = item.quantity * item.rate;
    const discount = item.discount || 0;
    return baseAmount - discount;
  }

  getTotalBeforeTax(): number {
    return this.selectedQuotation?.iteams.reduce((sum, item) => sum + (item.quantity * item.rate), 0) || 0;
  }

  getTotalCGST(): number {
    return this.selectedQuotation?.iteams.reduce((sum, item) => sum + ((item.quantity * item.rate) * item.cgst / 100), 0) || 0;
  }

  getTotalSGST(): number {
    return this.selectedQuotation?.iteams.reduce((sum, item) => sum + ((item.quantity * item.rate) * item.sgst / 100), 0) || 0;
  }

  getGrandTotal(): number {
    return this.getTotalBeforeTax() - this.getItemDiscount() + this.getTotalCGST() + this.getTotalSGST();
  }

  getItemTax(item: QuotationItem): number {
    const base = item.quantity * item.rate;
    return (base * item.cgst / 100) + (base * item.sgst / 100);
  }

  getItemDiscount(): number {
    if (!this.selectedQuotation?.iteams) return 0;
    return this.selectedQuotation.iteams.reduce((sum, item) => sum + (item.discount || 0), 0);
  }
}
