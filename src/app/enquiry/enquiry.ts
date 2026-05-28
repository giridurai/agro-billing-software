import { Component, OnInit } from '@angular/core';
import { FormGroup, NgForm, ReactiveFormsModule } from '@angular/forms';
import { EnquiryService } from './enquiryservices';
import { Enquiry } from '../models';
import { NotificationService } from '../services/notification.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-enquiry',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './enquiry.html',
  styleUrls: ['./enquiry.css'],
})
export class EnquiryComponent implements OnInit {
  enquiries: Enquiry[] = [];
  enquiryData: Enquiry = this.resetEnquiry();
  selectedEnquiry: Enquiry | null = null;
  searchText: string = '';

  constructor(
    private enquiryService: EnquiryService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadEnquiries();
  }

  loadEnquiries(): void {
    this.enquiryService.getEnquiries().subscribe({
      next: (res) => (this.enquiries = res),
      error: () => Swal.fire('Error', 'Failed to load enquiries', 'error'),
    });
  }

  get filteredEnquiries() {
    return this.enquiries.filter(
      (e) =>
        (e.enquiryNo?.toLowerCase() || '').includes(this.searchText.toLowerCase()) ||
        (e.companyName?.toLowerCase() || '').includes(this.searchText.toLowerCase()) ||
        (e.mobileNumber || '').includes(this.searchText) ||
        (e.assignedTo?.toLowerCase() || '').includes(this.searchText.toLowerCase()),
    );
  }

  openEnquiryModal() {
    this.selectedEnquiry = null;
    this.enquiryData = this.resetEnquiry();
    const modalEl = document.getElementById('enquiryModal');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  editEnquiry(enquiry: Enquiry) {
    this.selectedEnquiry = enquiry;
    this.enquiryData = { ...enquiry };
    const modalEl = document.getElementById('enquiryModal');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  closeEnquiryModal() {
    const modalEl = document.getElementById('enquiryModal');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  }

  viewEnquiry(enquiry: Enquiry) {
    this.selectedEnquiry = enquiry;
    const modalEl = document.getElementById('viewEnquiryModal');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  saveEnquiry(form: NgForm) {
    if (!form.valid) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    if (this.selectedEnquiry && this.selectedEnquiry.id) {
      this.enquiryService.updateEnquiry(this.selectedEnquiry.id, this.enquiryData).subscribe({
        next: () => {
          this.notificationService.addNotification(
            'Enquiry Updated', 
            `Enquiry #${this.enquiryData.enquiryNo} has been updated.`,
            'system'
          );
          Swal.fire('Updated', 'Enquiry updated successfully', 'success');
          this.loadEnquiries();
          this.closeEnquiryModal();
        },
        error: () => Swal.fire('Error', 'Failed to update enquiry', 'error'),
      });
    } else {
      const newEnq = { ...this.enquiryData };
      delete newEnq.id;
      this.enquiryService.addEnquiry(newEnq).subscribe({
        next: () => {
          this.notificationService.addNotification(
            'New Enquiry Received', 
            `A new enquiry from ${this.enquiryData.companyName} has been recorded.`,
            'system'
          );
          Swal.fire('Added', 'Enquiry added successfully', 'success');
          this.loadEnquiries();
          this.closeEnquiryModal();
          this.enquiryData = this.resetEnquiry();
        },
        error: () => Swal.fire('Error', 'Failed to add enquiry', 'error'),
      });
    }
  }

  deleteEnquiry(id: number | undefined) {
    if (!id) return;
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
    }).then((result) => {
      if (result.isConfirmed) {
        this.enquiryService.deleteEnquiry(id).subscribe({
          next: () => {
            this.notificationService.addNotification(
              'Enquiry Deleted', 
              'An enquiry record has been removed from the list.',
              'system'
            );
            Swal.fire('Deleted', 'Enquiry deleted', 'success');
            this.loadEnquiries();
          },
          error: () => Swal.fire('Error', 'Deletion failed', 'error'),
        });
      }
    });
  }

  printEnquiry(): void {
    const printContents = document.getElementById('printEnquirySection')?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      document.body.innerHTML = `
      <html>
        <head>
          <title>Enquiry Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h2 { text-align: center; margin-bottom: 20px; }
            .enquiry-details { border: 1px solid #ccc; padding: 15px; border-radius: 8px; }
            .enquiry-details p { margin: 6px 0; }
            .label { font-weight: bold; color: #333; }
            .value { color: #555; }
          </style>
        </head>
        <body>
          <h2>Enquiry Report</h2>
          <div class="enquiry-details">
            ${printContents}
          </div>
        </body>
      </html>
    `;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  }

  private resetEnquiry(): Enquiry {
    return {
      enquiryNo: '',
      userId: 'USER_101',
      enquiryDate: new Date().toISOString().substring(0, 10),
      companyName: '',
      mobileNumber: '',
      source: '',
      type: '',
      assignedTo: '',
      actionType: '',
      priority: 'Medium',
      status: 'Open',
    };
  }
}
