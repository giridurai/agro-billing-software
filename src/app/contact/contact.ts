import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';
import { Contact } from '../models';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';

declare var bootstrap: any;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css'],
})
export class ContactComponent implements OnInit {
  contacts: Contact[] = [];
  selectedContact: Contact | null = null;
  contactData: Contact = this.resetContact();
  searchText: string = '';

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    this.apiService.getContacts().subscribe({
      next: (data) => (this.contacts = data),
      error: (err) => console.error('Failed to load contacts:', err)
    });
  }

  get filteredContacts() {
    const q = this.searchText.toLowerCase();
    return this.contacts.filter(
      (c) =>
        c.contactName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q) ||
        c.linkedCompany.toLowerCase().includes(q)
    );
  }

  openContactModal() {
    this.selectedContact = null;
    this.contactData = this.resetContact();
    const modalEl = document.getElementById('contactModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  closeContactModal() {
    const modalEl = document.getElementById('contactModal');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  }

  editContact(contact: Contact) {
    this.selectedContact = contact;
    this.contactData = { ...contact };
    const modalEl = document.getElementById('contactModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  saveContact(form: any) {
    if (form.valid) {
      if (this.selectedContact) {
        // Update on server
        this.apiService.updateContact(this.contactData).subscribe({
          next: () => {
            this.loadContacts();
            this.notificationService.addNotification(
              'Contact Updated', 
              `Information for ${this.contactData.contactName} has been updated.`,
              'system'
            );
            Swal.fire('Updated!', 'Contact details saved.', 'success');
            this.closeContactModal();
          },
          error: () => Swal.fire('Error', 'Update failed', 'error')
        });
      } else {
        // Add on server
        const newContact = { ...this.contactData };
        delete (newContact as any).id;
        this.apiService.addContact(newContact).subscribe({
          next: () => {
            this.loadContacts();
            this.notificationService.addNotification(
              'New Contact Added', 
              `${this.contactData.contactName} from ${this.contactData.linkedCompany} was added.`,
              'system'
            );
            Swal.fire('Added!', 'New contact created.', 'success');
            this.closeContactModal();
          },
          error: () => Swal.fire('Error', 'Addition failed', 'error')
        });
      }
    }
  }

  deleteContact(id: number) {
    Swal.fire({
      title: 'Delete this contact?',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteContact(id).subscribe({
          next: () => {
            this.loadContacts();
            this.notificationService.addNotification(
              'Contact Deleted', 
              'A contact record has been removed.',
              'system'
            );
            Swal.fire('Deleted!', 'Contact removed.', 'success');
          },
          error: () => Swal.fire('Error', 'Deletion failed', 'error')
        });
      }
    });
  }

  private resetContact(): Contact {
    return {
      id: 0,
      contactName: '',
      contact: '',
      email: '',
      designation: '',
      department: '',
      linkedCompany: '',
    };
  }
}
