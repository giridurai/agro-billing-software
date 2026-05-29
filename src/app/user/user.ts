import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import Swal from 'sweetalert2';
import { User } from '../models';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';

declare var bootstrap: any;

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.html',
  styleUrls: ['./user.css'],
})
export class UserComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  userData: User = this.getEmptyUser();
  searchText: string = '';

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.apiService.getUsers().subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error('Failed to load users:', err)
    });
  }

  getEmptyUser(): User {
    return {
      id: 0,
      firstName: '',
      lastName: '',
      joiningDate: '2026-05-28',
      email: '',
      phoneNumber: '',
      gender: 'Male',
      role: 'Admin',
      password: '',
      username: '',
      status: 'Active',
      isOwner: false
    };
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'Admin': return 'bg-admin-role';
      case 'Sales Executive': return 'bg-sales-role';
      case 'Billing': return 'bg-billing-role';
      case 'Auditor': return 'bg-auditor-role';
      default: return 'bg-light text-dark';
    }
  }

  openUserModal() {
    this.selectedUser = null;
    this.userData = this.getEmptyUser();
    const modalEl = document.getElementById('userModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  editUser(user: User) {
    this.selectedUser = user;
    this.userData = { ...user };
    const modalEl = document.getElementById('userModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  closeUserModal() {
    const modalEl = document.getElementById('userModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
    this.selectedUser = null;
  }

  saveUser(form: NgForm) {
    if (form.valid) {
      if (this.selectedUser) {
        // Update existing user on server
        this.apiService.updateUser(this.userData).subscribe({
          next: () => {
            this.loadUsers();
            this.notificationService.addNotification(
              'User Updated', 
              `Account for ${this.userData.firstName} has been updated.`,
              'user'
            );
            Swal.fire('Updated!', `${this.userData.firstName} has been updated.`, 'success');
            this.closeUserModal();
          },
          error: () => Swal.fire('Error', 'Update failed', 'error')
        });
      } else {
        // Add new user on server
        const newUser = { ...this.userData };
        newUser.email = newUser.username + '@puvilink.com'; // Generate email from username
        delete (newUser as any).id; // Let server assign ID
        this.apiService.addUser(newUser).subscribe({
          next: () => {
            this.loadUsers();
            this.notificationService.addNotification(
              'New User Created', 
              `${this.userData.firstName} joined as ${this.userData.role}.`,
              'user'
            );
            Swal.fire('Added!', `${this.userData.firstName} has been added.`, 'success');
            this.closeUserModal();
          },
          error: () => Swal.fire('Error', 'Addition failed', 'error')
        });
      }
    }
  }

  clearForm(form: NgForm) {
    form.resetForm();
    this.userData = this.getEmptyUser();
  }

  deleteUser(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will be permanently deleted from the database!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteUser(id).subscribe({
          next: () => {
            this.loadUsers();
            this.notificationService.addNotification(
              'User Account Deleted', 
              'A team member account has been deactivated and removed.',
              'user'
            );
            Swal.fire('Deleted!', 'User has been removed.', 'success');
          },
          error: () => Swal.fire('Error', 'Deletion failed', 'error')
        });
      }
    });
  }
}
