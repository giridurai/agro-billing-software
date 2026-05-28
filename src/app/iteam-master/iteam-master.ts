import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Item } from '../models';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-iteam-master',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './iteam-master.html',
  styleUrl: './iteam-master.css',
})
export class IteamMaster implements OnInit {
  items: Item[] = [];
  selectedItem: Item | null = null;
  itemData: Item = this.resetItemData();
  searchText: string = '';

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems() {
    this.apiService.getItems().subscribe({
      next: (data) => (this.items = data),
      error: (err) => console.error('Failed to load items:', err)
    });
  }

  private resetItemData(): Item {
    return {
      id: 0,
      name: '',
      description: '',
      hsnCode: '',
      rate: 0,
      cgst: 0,
      sgst: 0,
      discount: 0,
    };
  }

  printItem(): void {
    const printContents = document.getElementById('printItemSection')?.innerHTML;
    if (printContents) {
      const popupWin = window.open('', '_blank', 'width=800,height=900');
      popupWin!.document.open();
      popupWin!.document.write(`
      <html>
        <head>
          <title>Item Details</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h5 { margin-bottom: 15px; }
            p { margin: 5px 0; }
            strong { color: #333; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          ${printContents}
        </body>
      </html>
    `);
      popupWin!.document.close();
    }
  }

  viewItem(item: Item): void {
    this.selectedItem = item;
    const modal = document.getElementById('viewItemModal');
    if (modal) (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
  }

  openItemModal(): void {
    this.selectedItem = null;
    this.itemData = this.resetItemData();
    const modal = document.getElementById('itemModal');
    if (modal) (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
  }

  closeItemModal(): void {
    const modal = document.getElementById('itemModal');
    if (modal) (window as any).bootstrap.Modal.getOrCreateInstance(modal).hide();
  }

  saveItem(form: any): void {
    if (form.valid) {
      if (this.selectedItem) {
        // Update on server
        this.apiService.updateItem(this.itemData).subscribe({
            next: () => {
                this.loadItems();
                this.notificationService.addNotification(
                  'Catalog Updated', 
                  `Item "${this.itemData.name}" has been modified in the master catalog.`,
                  'system'
                );
                Swal.fire('Updated!', 'Inventory item modified.', 'success');
                this.closeItemModal();
            },
            error: () => Swal.fire('Error', 'Update failed', 'error')
        });
      } else {
        // Add on server
        const newItem = { ...this.itemData };
        delete (newItem as any).id;
        this.apiService.addItem(newItem).subscribe({
            next: () => {
                this.loadItems();
                this.notificationService.addNotification(
                  'New Item Added', 
                  `"${this.itemData.name}" added to the product catalog.`,
                  'system'
                );
                Swal.fire('Added!', 'Item added to catalog.', 'success');
                this.closeItemModal();
            },
            error: () => Swal.fire('Error', 'Addition failed', 'error')
        });
      }
    }
  }

  editItem(item: Item): void {
    this.selectedItem = item;
    this.itemData = { ...item };
    const modal = document.getElementById('itemModal');
    if (modal) (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
  }

  deleteItem(id: number): void {
    Swal.fire({
        title: 'Remove this item?',
        icon: 'warning',
        showCancelButton: true
    }).then((result) => {
        if (result.isConfirmed) {
            this.apiService.deleteItem(id).subscribe({
                next: () => {
                    this.loadItems();
                    this.notificationService.addNotification(
                      'Item Purged', 
                      'A product has been removed from the catalog.',
                      'system'
                    );
                    Swal.fire('Removed!', 'Item purged from catalog.', 'success');
                },
                error: () => Swal.fire('Error', 'Deletion failed', 'error')
            });
        }
    });
  }
}
