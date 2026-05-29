import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { StockRecord, Item } from '../../models';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-stock-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-management.html',
})
export class StockManagementComponent implements OnInit {
  inventory: any[] = [];
  adjustmentHistory: StockRecord[] = [];
  searchText: string = '';

  // Barcode Inward Simulation
  isBarcodeMode: boolean = true;
  decodedSuccess: boolean = false;
  scannedBarcode: string = '';
  scannedProduct: any = null;

  inwardQty: number = 10;
  inwardBatch: string = '';
  inwardMfg: string = '';
  inwardExpiry: string = '';

  // Manual Adjust form
  showForm: boolean = false;
  selectedProductName: string = '';
  direction: 'Inward' | 'Outward' = 'Inward';
  quantity: number = 10;
  reason: string = 'Found excess in stocktake';

  reasonsList: string[] = [
    'Found excess in stocktake',
    'Bags damaged due to moisture',
    'Expired stock disposal',
    'Customer return check',
    'Supplier dispatch correction'
  ];

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadInventory();
    this.loadHistory();
  }

  loadInventory() {
    this.apiService.getItems().subscribe({
      next: (data) => {
        this.inventory = data.map(item => this.enhanceItem(item));
      },
      error: (err) => console.error('Failed to load items:', err)
    });
  }

  loadHistory() {
    this.apiService.getStockRecords().subscribe({
      next: (data) => (this.adjustmentHistory = data.slice().reverse()),
      error: (err) => console.error('Failed to load history:', err)
    });
  }

  get filteredInventory() {
    return this.inventory.filter((item) =>
      item.mockName.toLowerCase().includes(this.searchText.toLowerCase()) ||
      item.brand.toLowerCase().includes(this.searchText.toLowerCase()) ||
      item.mockCategory.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  enhanceItem(item: Item): any {
    switch (item.id) {
      case 1:
        return {
          ...item,
          mockName: 'Urea 46% Granular (IFFCO)',
          brand: 'IFFCO',
          hsnCode: '3102',
          barcode: '8901051500311',
          activeBatch: 'BATCH-2026',
          mockCategory: 'Fertilizer',
          unit: 'Bags'
        };
      case 2:
        return {
          ...item,
          mockName: 'DAP 18:46:0 (Coromandel)',
          brand: 'Coromandel',
          hsnCode: '3105',
          barcode: '8902031401222',
          activeBatch: 'DP-8812',
          mockCategory: 'Fertilizer',
          unit: 'Bags'
        };
      case 3:
        return {
          ...item,
          mockName: 'Monocrotophos Insecticide',
          brand: 'Tata Rallis',
          hsnCode: '3808',
          barcode: '8901112223334',
          activeBatch: 'MN-9922',
          mockCategory: 'Pesticide',
          unit: 'Bottles'
        };
      case 4:
        return {
          ...item,
          mockName: 'Neem Oil Bio-Agent (500ml)',
          brand: 'Organic Farms',
          hsnCode: '3808',
          barcode: '8903334445551',
          activeBatch: 'NM-002',
          mockCategory: 'Bio-stimulants',
          unit: 'Bottles'
        };
      case 5:
        return {
          ...item,
          mockName: 'Hybrid Paddy Seeds - Swarna',
          brand: 'Nuziveedu Seeds',
          hsnCode: '1209',
          barcode: '8904445556662',
          activeBatch: 'SW-404',
          mockCategory: 'Seeds',
          unit: 'Bags'
        };
      default:
        return {
          ...item,
          mockName: item.name,
          brand: 'Generic',
          barcode: '890' + Math.floor(1000000000 + Math.random() * 9000000000),
          activeBatch: 'BATCH-2026',
          mockCategory: item.category || 'Agricultural Input',
          unit: item.unit?.includes('Bottle') ? 'Bottles' : 'Bags'
        };
    }
  }

  onBarcodeScanned() {
    if (!this.scannedBarcode) return;
    
    const match = this.inventory.find(item => item.barcode === this.scannedBarcode);
    if (match) {
      this.playBeep();
      this.scannedProduct = match;
      this.decodedSuccess = true;
      this.inwardQty = 10;
      this.inwardBatch = match.activeBatch + 'B';
      this.inwardMfg = new Date().toISOString().split('T')[0];
      this.inwardExpiry = new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else {
      Swal.fire('Not Found', 'Barcode does not match any registered product.', 'warning');
      this.decodedSuccess = false;
      this.scannedProduct = null;
    }
  }

  simulateBarcodeClick(barcode: string) {
    this.scannedBarcode = barcode;
    this.onBarcodeScanned();
  }

  playBeep() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1100, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
  }

  testScannerSound() {
    this.playBeep();
    Swal.fire({
      title: 'Scanner Sound Tested',
      text: 'USB Barcode reader sound emulator online.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  }

  submitBarcodeInward() {
    if (!this.scannedProduct) return;

    const record: StockRecord = {
      id: 0,
      product: this.scannedProduct.name,
      quantity: this.inwardQty,
      date: new Date().toISOString().split('T')[0],
      type: 'Inward',
      notes: `Consignment PO inward: ${this.inwardBatch}`
    };

    this.apiService.addStockRecord(record).subscribe({
      next: () => {
        const originalItem = this.inventory.find(item => item.id === this.scannedProduct.id);
        if (originalItem) {
          const rawItemToSave: Item = {
            id: originalItem.id,
            name: originalItem.name,
            description: originalItem.description,
            rate: originalItem.rate,
            cgst: originalItem.cgst,
            sgst: originalItem.sgst,
            hsnCode: originalItem.hsnCode,
            discount: originalItem.discount,
            category: originalItem.category,
            unit: originalItem.unit,
            stockQuantity: (originalItem.stockQuantity || 0) + this.inwardQty
          };

          this.apiService.updateItem(rawItemToSave).subscribe({
            next: () => {
              this.loadInventory();
              this.loadHistory();
              this.notificationService.addNotification(
                'Barcode Inward Logged',
                `Barcode scanner inward log of +${this.inwardQty} for ${this.scannedProduct.mockName}`,
                'system'
              );
              Swal.fire({
                title: 'Inward Successful',
                text: `${this.inwardQty} ${this.scannedProduct.unit} logged into database.`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
              });
              
              this.scannedBarcode = '';
              this.decodedSuccess = false;
              this.scannedProduct = null;
            }
          });
        }
      }
    });
  }

  openAddForm() {
    this.selectedProductName = '';
    this.direction = 'Inward';
    this.quantity = 10;
    this.reason = 'Found excess in stocktake';
    this.showForm = true;
  }

  cancelAdjustment() {
    this.showForm = false;
  }

  submitAdjustment(form: any) {
    if (form.valid && this.selectedProductName) {
      const targetItem = this.inventory.find(item => item.name === this.selectedProductName);
      if (!targetItem) return;

      if (this.direction === 'Outward' && (targetItem.stockQuantity || 0) < this.quantity) {
        Swal.fire('Insufficient Stock!', `Cannot adjust outward. Only ${targetItem.stockQuantity} units available.`, 'error');
        return;
      }

      const record: StockRecord = {
        id: 0,
        product: this.selectedProductName,
        quantity: this.quantity,
        date: new Date().toISOString().split('T')[0],
        type: this.direction,
        notes: `Manual Stock Correction: ${this.reason}`
      };

      this.apiService.addStockRecord(record).subscribe({
        next: () => {
          const rawItemToSave: Item = {
            id: targetItem.id,
            name: targetItem.name,
            description: targetItem.description,
            rate: targetItem.rate,
            cgst: targetItem.cgst,
            sgst: targetItem.sgst,
            hsnCode: targetItem.hsnCode,
            discount: targetItem.discount,
            category: targetItem.category,
            unit: targetItem.unit,
            stockQuantity: this.direction === 'Inward' 
              ? (targetItem.stockQuantity || 0) + this.quantity
              : (targetItem.stockQuantity || 0) - this.quantity
          };

          this.apiService.updateItem(rawItemToSave).subscribe({
            next: () => {
              this.loadInventory();
              this.loadHistory();
              this.notificationService.addNotification(
                'Stock Level Adjusted',
                `Manual correction of ${this.direction === 'Inward' ? '+' : '-'}${this.quantity} bags for ${targetItem.name}.`,
                'system'
              );
              Swal.fire('Success', 'Inventory levels adjusted and logged.', 'success');
              this.quantity = 10;
              this.showForm = false;
            }
          });
        }
      });
    }
  }

  getMockProductName(productName: string): string {
    const found = this.inventory.find(item => item.name === productName);
    return found ? found.mockName : productName;
  }
}
