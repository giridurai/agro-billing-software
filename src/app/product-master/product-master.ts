import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Item } from '../models';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-product-master',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './product-master.html',
  styleUrl: './product-master.css',
})
export class ProductMasterComponent implements OnInit {
  items: Item[] = [];
  selectedItem: Item | null = null;
  itemData: Item = this.resetItemData();
  searchText: string = '';

  categories: string[] = ['Fertilizers', 'Seeds', 'Pesticides', 'Bio-Organics', 'Tools', 'Irrigation'];
  units: string[] = ['Bag (50kg)', 'Bag (25kg)', 'Bag (40kg)', 'Bottle (1L)', 'Bottle (500ml)', 'Canister (5L)', 'Pcs', 'Kg', 'Litre'];

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

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
      cgst: 5,
      sgst: 5,
      discount: 0,
      category: 'Fertilizers',
      unit: 'Bag (50kg)',
      stockQuantity: 100
    };
  }

  get filteredItems(): Item[] {
    return this.items.filter(
      (item) =>
        item.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (item.hsnCode || '').toLowerCase().includes(this.searchText.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  printItem(): void {
    const printContents = document.getElementById('printItemSection')?.innerHTML;
    if (printContents) {
      const popupWin = window.open('', '_blank', 'width=800,height=900');
      popupWin!.document.open();
      popupWin!.document.write(`
      <html>
        <head>
          <title>Product Details</title>
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
    if (modal) bootstrap.Modal.getOrCreateInstance(modal).show();
  }

  openItemModal(): void {
    this.selectedItem = null;
    this.itemData = this.resetItemData();
    const modal = document.getElementById('itemModal');
    if (modal) bootstrap.Modal.getOrCreateInstance(modal).show();
  }

  closeItemModal(): void {
    const modal = document.getElementById('itemModal');
    if (modal) bootstrap.Modal.getOrCreateInstance(modal).hide();
  }

  saveItem(form: any): void {
    if (form.valid) {
      if (this.selectedItem) {
        this.apiService.updateItem(this.itemData).subscribe({
          next: () => {
            this.loadItems();
            this.notificationService.addNotification(
              'Product Catalog Updated',
              `Product "${this.itemData.name}" has been modified in the catalog.`,
              'system'
            );
            Swal.fire('Updated!', 'Product details modified.', 'success');
            this.closeItemModal();
          },
          error: () => Swal.fire('Error', 'Update failed', 'error')
        });
      } else {
        const newItem = { ...this.itemData };
        delete (newItem as any).id;
        this.apiService.addItem(newItem).subscribe({
          next: () => {
            this.loadItems();
            this.notificationService.addNotification(
              'New Product Added',
              `Product "${this.itemData.name}" added to the catalog.`,
              'system'
            );
            Swal.fire('Added!', 'Product added to catalog.', 'success');
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
    if (modal) bootstrap.Modal.getOrCreateInstance(modal).show();
  }

  deleteItem(id: number): void {
    Swal.fire({
      title: 'Remove this product?',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteItem(id).subscribe({
          next: () => {
            this.loadItems();
            this.notificationService.addNotification(
              'Product Removed',
              'A product has been removed from the catalog.',
              'system'
            );
            Swal.fire('Removed!', 'Product removed from catalog.', 'success');
          },
          error: () => Swal.fire('Error', 'Deletion failed', 'error')
        });
      }
    });
  }
}
