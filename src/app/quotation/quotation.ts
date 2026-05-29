import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Quotation, QuotationItem, Item, Company } from '../models';
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
  companies: Company[] = [];
  quotations: Quotation[] = [];
  selectedQuotation: Quotation | null = null;
  quotationData: Quotation = this.resetQuotation();
  searchText: string = '';
  showForm: boolean = false;

  // Temporary Inline Form Items
  selectedItemName: string = '';
  selectedItemQty: number = 1;
  selectedItemRate: number = 0;

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.apiService.getItems().subscribe(data => this.items = data);
    this.apiService.getCompanies().subscribe(data => this.companies = data);
    this.loadQuotations();
  }

  loadQuotations() {
    this.apiService.getQuotations().subscribe({
      next: (data) => (this.quotations = data),
      error: (err) => console.error('Failed to load quotations:', err)
    });
  }

  onProductSelect() {
    const master = this.items.find(i => i.name === this.selectedItemName);
    if (master) {
      this.selectedItemRate = master.rate;
      this.selectedItemQty = 1;
    } else {
      this.selectedItemRate = 0;
      this.selectedItemQty = 1;
    }
  }

  addFormLine() {
    if (!this.selectedItemName) {
      Swal.fire('Selection Required', 'Please select a product first.', 'warning');
      return;
    }
    const master = this.items.find(i => i.name === this.selectedItemName);
    if (!master) return;

    const cgstVal = master.cgst || 0;
    const sgstVal = master.sgst || 0;
    const discountVal = master.discount || 0;
    const base = this.selectedItemQty * this.selectedItemRate;
    const taxable = base - discountVal;
    const cgstAmount = (taxable * cgstVal) / 100;
    const sgstAmount = (taxable * sgstVal) / 100;
    const totalAmount = taxable + cgstAmount + sgstAmount;

    const existing = this.quotationData.iteams.find(it => it.name === this.selectedItemName);
    if (existing) {
      existing.quantity += this.selectedItemQty;
      const newBase = existing.quantity * existing.rate;
      const newTaxable = newBase - (existing.discount || 0);
      existing.amount = newTaxable + (newTaxable * existing.cgst / 100) + (newTaxable * existing.sgst / 100);
    } else {
      this.quotationData.iteams.push({
        name: master.name,
        quantity: this.selectedItemQty,
        rate: this.selectedItemRate,
        cgst: cgstVal,
        sgst: sgstVal,
        hsnCode: master.hsnCode || '',
        discount: discountVal,
        amount: totalAmount
      });
    }

    this.selectedItemName = '';
    this.selectedItemRate = 0;
    this.selectedItemQty = 1;
    this.recalculateTotals();
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
        (quotation.contact && quotation.contact.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }

  openQuotationModal() {
    this.selectedQuotation = null;
    this.quotationData = this.resetQuotation();
    this.generateQuotationNo();
    this.showForm = true;
  }

  editQuotation(quotation: Quotation) {
    this.selectedQuotation = quotation;
    this.quotationData = JSON.parse(JSON.stringify(quotation));
    this.showForm = true;
  }

  closeQuotationModal() {
    // Hide standard bootstrap modals if open
    const viewModalEl = document.getElementById('viewQuotationModal');
    if (viewModalEl) {
      const modal = bootstrap.Modal.getInstance(viewModalEl);
      if (modal) modal.hide();
    }
    this.showForm = false;
  }

  generateQuotationNo() {
    const yr = new Date().getFullYear().toString().slice(-2);
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.quotationData.quotationNo = `QUO-${yr}-${rand}`;
    this.quotationData.quotationDate = new Date().toISOString().split('T')[0];
    this.quotationData.expiryDate = '';
    this.quotationData.referenceNo = `REF-AGR-${Math.floor(100 + Math.random() * 900)}`;
  }

  resetForm() {
    this.quotationData = this.resetQuotation();
    this.generateQuotationNo();
    this.selectedItemName = '';
    this.selectedItemQty = 1;
    this.selectedItemRate = 0;
  }

  saveQuotation(form: any) {
    if (!this.quotationData.companyName) {
      Swal.fire('Validation Error', 'Please select a Farmer / Customer.', 'error');
      return;
    }
    if (this.quotationData.iteams.length === 0) {
      Swal.fire('Validation Error', 'Please add at least one crop line item.', 'error');
      return;
    }

    this.recalculateTotals();
    const contactName = this.companies.find(c => c.companyName === this.quotationData.companyName)?.contactPerson || 'Farmer';
    this.quotationData.contact = contactName;

    if (this.selectedQuotation) {
      // Update
      this.apiService.updateQuotation(this.quotationData).subscribe({
        next: () => {
          this.loadQuotations();
          this.notificationService.addNotification(
            'Quotation Updated', 
            `Quotation #${this.quotationData.quotationNo} has been modified.`,
            'quotation'
          );
          Swal.fire('Updated!', 'Quotation draft modified successfully.', 'success');
          this.showForm = false;
        },
        error: () => Swal.fire('Error', 'Update failed', 'error')
      });
    } else {
      // Add
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
          Swal.fire('Saved!', 'New crop quotation draft created successfully.', 'success');
          this.showForm = false;
        },
        error: () => Swal.fire('Error', 'Addition failed', 'error')
      });
    }
  }

  deleteQuotation(id: number) {
    Swal.fire({
      title: 'Remove this quotation draft?',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteQuotation(id).subscribe({
          next: () => {
            this.loadQuotations();
            this.notificationService.addNotification(
              'Quotation Deleted', 
              'A quotation has been removed.',
              'quotation'
            );
            Swal.fire('Deleted!', 'Quotation draft removed.', 'success');
          },
          error: () => Swal.fire('Error', 'Deletion failed', 'error')
        });
      }
    });
  }

  convertInvoice(quotation: Quotation) {
    const invoiceData = {
      id: 0,
      invoiceNo: 'INV-' + new Date().getFullYear().toString().slice(-2) + '-' + String(Math.floor(1000 + Math.random() * 9000)),
      orderNo: 'ORD-' + new Date().getFullYear().toString().slice(-2) + '-' + String(Math.floor(1000 + Math.random() * 9000)),
      customerName: quotation.companyName,
      customerGSTIN: this.companies.find(c => c.companyName === quotation.companyName)?.gst || 'Not Applicable',
      billingAddress: this.companies.find(c => c.companyName === quotation.companyName)?.billingAddress || 'Guntur Market, AP',
      status: 'Paid',
      dueDate: quotation.expiryDate || new Date().toISOString().split('T')[0],
      amount: quotation.amount,
      balanceDue: 0,
      vehicleNo: 'AP-07-TR-9988',
      items: quotation.iteams.map(it => ({
        name: it.name,
        quantity: it.quantity,
        rate: it.rate,
        cgst: it.cgst,
        sgst: it.sgst,
        discount: it.discount || 0,
        amount: it.amount,
        hsnCode: it.hsnCode
      }))
    };

    this.apiService.addInvoice(invoiceData).subscribe({
      next: () => {
        this.notificationService.addNotification(
          'Invoice Generated',
          `Invoice created from quotation ${quotation.quotationNo} for ${quotation.companyName}.`,
          'invoice'
        );
        Swal.fire('Converted!', `Quotation ${quotation.quotationNo} successfully transformed into Sales Invoice!`, 'success');
        this.apiService.deleteQuotation(quotation.id).subscribe({
          next: () => this.loadQuotations()
        });
      },
      error: () => Swal.fire('Error', 'Conversion failed', 'error')
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
      termsconditions: '1. Standard Agro seed and chemical rules apply.\n2. Goods once sold are not returnable.\n3. Make payment upon receipt of the delivery vehicle.',
      lineitems: [],
      status: 'Pending',
      amount: 0,
      iteams: [],
    };
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

  getFormSubtotal(): number {
    return this.quotationData.iteams.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  }

  getFormTax(): number {
    return this.quotationData.iteams.reduce((sum, item) => {
      const base = item.quantity * item.rate;
      const taxable = base - (item.discount || 0);
      return sum + (taxable * item.cgst / 100) + (taxable * item.sgst / 100);
    }, 0);
  }

  getFormTotal(): number {
    return this.quotationData.iteams.reduce((sum, item) => sum + item.amount, 0);
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
