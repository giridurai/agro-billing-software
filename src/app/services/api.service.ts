import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User, Invoice, Company, Contact, Item, Quotation, Supplier, PurchaseInvoice, ReturnRecord, StockRecord, Warehouse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() {
    this.initLocalStorage();
  }

  private initLocalStorage() {
    // 1. Initial Users
    if (!localStorage.getItem('users')) {
      const initialUsers: User[] = [
        { id: 1, firstName: 'Admin', lastName: 'User', joiningDate: '2025-01-01', email: 'crm@crm.com', phoneNumber: '9876543210', gender: 'Male', role: 'Administrator' },
        { id: 2, firstName: 'Rajesh', lastName: 'Kumar', joiningDate: '2025-02-15', email: 'rajesh@puvilink.com', phoneNumber: '9123456789', gender: 'Male', role: 'Sales Manager' },
        { id: 3, firstName: 'Sunita', lastName: 'Patil', joiningDate: '2025-03-10', email: 'sunita@puvilink.com', phoneNumber: '8123456789', gender: 'Female', role: 'Billing Operator' }
      ];
      localStorage.setItem('users', JSON.stringify(initialUsers));
    }

    // 2. Initial Products (Items)
    if (!localStorage.getItem('items')) {
      const initialItems: Item[] = [
        { id: 1, name: 'Premium NPK Fertilizer 19-19-19', description: 'Water soluble fertilizer for balanced crop growth', rate: 1200, cgst: 9, sgst: 9, hsnCode: '3105', discount: 5, category: 'Fertilizers', unit: 'Bag (50kg)', stockQuantity: 180 },
        { id: 2, name: 'Hybrid Paddy Seeds - PR126', description: 'Short duration, high-yielding hybrid paddy seeds', rate: 1650, cgst: 0, sgst: 0, hsnCode: '1209', discount: 2, category: 'Seeds', unit: 'Bag (25kg)', stockQuantity: 240 },
        { id: 3, name: 'Neem-based Bio Pesticide (Liquid)', description: 'Concentrated organic neem oil insect repellent', rate: 450, cgst: 6, sgst: 6, hsnCode: '3808', discount: 10, category: 'Pesticides', unit: 'Bottle (1L)', stockQuantity: 95 },
        { id: 4, name: 'Organic Compost Booster', description: 'Microbial compost accelerant for soil enrichment', rate: 350, cgst: 2.5, sgst: 2.5, hsnCode: '3101', discount: 0, category: 'Bio-Organics', unit: 'Bag (40kg)', stockQuantity: 120 },
        { id: 5, name: 'Glyphosate Herbicide 41% SL', description: 'Systemic post-emergence weed control solution', rate: 680, cgst: 9, sgst: 9, hsnCode: '3808', discount: 8, category: 'Pesticides', unit: 'Canister (5L)', stockQuantity: 60 }
      ];
      localStorage.setItem('items', JSON.stringify(initialItems));
    }

    // 3. Initial Companies (reused as Customers in Agro context)
    if (!localStorage.getItem('companies')) {
      const initialCompanies: Company[] = [
        { id: 1, companyName: 'Annapurna Farmers Cooperative', pan: 'AAAFA1234Z', gst: '29AAAFA1234Z1Z5', contactNumber: '9900887766', email: 'annapurna@farmers.org', contactPerson: 'Somanna Gowda', status: 'Active', industryType: 'Agriculture', billingAddress: 'Main Bazar, Mandya, Karnataka - 571401', shippingAddress: 'Godown Road, Mandya, Karnataka - 571401' },
        { id: 2, companyName: 'Balaji Agro Agencies', pan: 'AABFB5678Y', gst: '29AABFB5678Y2Z1', contactNumber: '8877665544', email: 'balaji@agro.com', contactPerson: 'Venkatesh Prasad', status: 'Active', industryType: 'Retailer', billingAddress: 'APMC Yard, Shimoga, Karnataka - 577201', shippingAddress: 'APMC Yard, Shimoga, Karnataka - 577201' },
        { id: 3, companyName: 'Cauvery Bio-Tech Farms', pan: 'AACFC9012X', gst: '29AACFC9012X3Z8', contactNumber: '7766554433', email: 'cauvery@biotech.in', contactPerson: 'Ranganath Swamy', status: 'Active', industryType: 'Corporate Farm', billingAddress: 'Industrial Suburb, Mysore, Karnataka - 570018', shippingAddress: 'Cauvery Farms, Nanjangud, Karnataka - 571301' }
      ];
      localStorage.setItem('companies', JSON.stringify(initialCompanies));
    }

    // 4. Initial Contacts
    if (!localStorage.getItem('contacts')) {
      const initialContacts: Contact[] = [
        { id: 1, contactName: 'Somanna Gowda', contact: '9900887766', email: 'somanna@farmers.org', designation: 'Chairman', department: 'Management', linkedCompany: 'Annapurna Farmers Cooperative' },
        { id: 2, contactName: 'Venkatesh Prasad', contact: '8877665544', email: 'venky.prasad@agro.com', designation: 'Proprietor', department: 'Sales', linkedCompany: 'Balaji Agro Agencies' }
      ];
      localStorage.setItem('contacts', JSON.stringify(initialContacts));
    }

    // 5. Initial Quotations
    if (!localStorage.getItem('quotations')) {
      const initialQuotations: Quotation[] = [
        {
          id: 1,
          quotationNo: 'QT-2026-001',
          referenceNo: 'REF-ANP-992',
          companyName: 'Annapurna Farmers Cooperative',
          contact: 'Somanna Gowda',
          quotationDate: '2026-05-10',
          expiryDate: '2026-06-10',
          termsconditions: 'Goods once sold will not be taken back. Payment due upon delivery.',
          status: 'Approved',
          amount: 279300,
          iteams: [
            { name: 'Premium NPK Fertilizer 19-19-19', quantity: 150, rate: 1200, cgst: 9, sgst: 9, discount: 5, amount: 202350, hsnCode: '3105' },
            { name: 'Hybrid Paddy Seeds - PR126', quantity: 50, rate: 1650, cgst: 0, sgst: 0, discount: 2, amount: 76950, hsnCode: '1209' }
          ]
        },
        {
          id: 2,
          quotationNo: 'QT-2026-002',
          referenceNo: 'REF-BLJ-105',
          companyName: 'Balaji Agro Agencies',
          contact: 'Venkatesh Prasad',
          quotationDate: '2026-05-20',
          expiryDate: '2026-06-20',
          termsconditions: 'Special distributor discount applied. Valid for 30 days.',
          status: 'Pending',
          amount: 80920,
          iteams: [
            { name: 'Neem-based Bio Pesticide (Liquid)', quantity: 100, rate: 450, cgst: 6, sgst: 6, discount: 10, amount: 45360, hsnCode: '3808' },
            { name: 'Glyphosate Herbicide 41% SL', quantity: 50, rate: 680, cgst: 9, sgst: 9, discount: 8, amount: 35560, hsnCode: '3808' }
          ]
        }
      ];
      localStorage.setItem('quotations', JSON.stringify(initialQuotations));
    }

    // 6. Initial Invoices (Sales Invoices)
    if (!localStorage.getItem('invoices')) {
      const initialInvoices: Invoice[] = [
        {
          id: 1,
          invoiceNo: 'INV-2026-001',
          orderNo: 'ORD-ANP-992',
          customerName: 'Annapurna Farmers Cooperative',
          customerGSTIN: '29AAAFA1234Z1Z5',
          billingAddress: 'Main Bazar, Mandya, Karnataka - 571401',
          status: 'Paid',
          dueDate: '2026-06-10',
          amount: 279300,
          balanceDue: 0,
          vehicleNo: 'KA-11-F-4321',
          items: [
            { name: 'Premium NPK Fertilizer 19-19-19', quantity: 150, rate: 1200, cgst: 9, sgst: 9, discount: 5, amount: 202350, hsnCode: '3105' },
            { name: 'Hybrid Paddy Seeds - PR126', quantity: 50, rate: 1650, cgst: 0, sgst: 0, discount: 2, amount: 76950, hsnCode: '1209' }
          ]
        },
        {
          id: 2,
          invoiceNo: 'INV-2026-002',
          orderNo: 'ORD-BLJ-105',
          customerName: 'Balaji Agro Agencies',
          customerGSTIN: '29AABFB5678Y2Z1',
          billingAddress: 'APMC Yard, Shimoga, Karnataka - 577201',
          status: 'Unpaid',
          dueDate: '2026-06-25',
          amount: 80920,
          balanceDue: 80920,
          vehicleNo: 'KA-14-M-9876',
          items: [
            { name: 'Neem-based Bio Pesticide (Liquid)', quantity: 100, rate: 450, cgst: 6, sgst: 6, discount: 10, amount: 45360, hsnCode: '3808' },
            { name: 'Glyphosate Herbicide 41% SL', quantity: 50, rate: 680, cgst: 9, sgst: 9, discount: 8, amount: 35560, hsnCode: '3808' }
          ]
        }
      ];
      localStorage.setItem('invoices', JSON.stringify(initialInvoices));
    }

    // 7. Initial Suppliers
    if (!localStorage.getItem('suppliers')) {
      const initialSuppliers: Supplier[] = [
        { id: 1, supplierName: 'IFFCO Fertilizer Corporation', contactNumber: '011-26543210', address: 'IFFCO Sadan, Saket Place, New Delhi - 110017', gstNumber: '07AAACI0845F1Z7' },
        { id: 2, supplierName: 'Syngenta Seeds India Ltd', contactNumber: '020-66442200', address: 'Amar Paradigm, Baner Road, Pune, Maharashtra - 411045', gstNumber: '27AAACS4321B2Z2' },
        { id: 3, supplierName: 'Bayer CropScience India', contactNumber: '022-25311234', address: 'Kolshet Road, Thane West, Maharashtra - 400607', gstNumber: '27AAACB8901C3Z5' }
      ];
      localStorage.setItem('suppliers', JSON.stringify(initialSuppliers));
    }

    // 8. Initial Purchase Invoices
    if (!localStorage.getItem('purchaseInvoices')) {
      const initialPurchaseInvoices: PurchaseInvoice[] = [
        {
          id: 1,
          invoiceNo: 'PUR-2026-101',
          supplierName: 'IFFCO Fertilizer Corporation',
          invoiceDate: '2026-05-01',
          dueDate: '2026-05-31',
          amount: 472000,
          status: 'Paid',
          items: [
            { name: 'Premium NPK Fertilizer 19-19-19', quantity: 400, rate: 1000, cgst: 9, sgst: 9, amount: 472000 }
          ]
        },
        {
          id: 2,
          invoiceNo: 'PUR-2026-102',
          supplierName: 'Syngenta Seeds India Ltd',
          invoiceDate: '2026-05-15',
          dueDate: '2026-06-15',
          amount: 210000,
          status: 'Pending',
          items: [
            { name: 'Hybrid Paddy Seeds - PR126', quantity: 150, rate: 1400, cgst: 0, sgst: 0, amount: 210000 }
          ]
        }
      ];
      localStorage.setItem('purchaseInvoices', JSON.stringify(initialPurchaseInvoices));
    }

    // 9. Initial Returns
    if (!localStorage.getItem('returns')) {
      const initialReturns: ReturnRecord[] = [
        { id: 1, returnNumber: 'RET-001', product: 'Premium NPK Fertilizer 19-19-19', quantity: 10, reason: 'Damaged packaging during transit', date: '2026-05-12' },
        { id: 2, returnNumber: 'RET-002', product: 'Neem-based Bio Pesticide (Liquid)', quantity: 5, reason: 'Expired stock delivered', date: '2026-05-22' }
      ];
      localStorage.setItem('returns', JSON.stringify(initialReturns));
    }

    // 10. Initial Stock Records
    if (!localStorage.getItem('stockRecords')) {
      const initialStockRecords: StockRecord[] = [
        { id: 1, product: 'Premium NPK Fertilizer 19-19-19', quantity: 400, date: '2026-05-01', type: 'Inward', notes: 'Procured from IFFCO' },
        { id: 2, product: 'Premium NPK Fertilizer 19-19-19', quantity: 150, date: '2026-05-10', type: 'Outward', notes: 'Sold to Annapurna Coop' },
        { id: 3, product: 'Hybrid Paddy Seeds - PR126', quantity: 150, date: '2026-05-15', type: 'Inward', notes: 'Procured from Syngenta' },
        { id: 4, product: 'Hybrid Paddy Seeds - PR126', quantity: 50, date: '2026-05-20', type: 'Outward', notes: 'Sold to Annapurna Coop' }
      ];
      localStorage.setItem('stockRecords', JSON.stringify(initialStockRecords));
    }

    // 11. Initial Warehouses
    if (!localStorage.getItem('warehouses')) {
      const initialWarehouses: Warehouse[] = [
        { id: 1, warehouseName: 'Main Seed Cold Storage', location: 'Section A, Mandya Hub', capacity: 2500 },
        { id: 2, warehouseName: 'Fertilizer Bulk Godown', location: 'Plot 12, APMC Industrial Area', capacity: 8000 },
        { id: 3, warehouseName: 'Pesticide & Chemical Yard', location: 'Secure Wing, APMC Compound', capacity: 1500 }
      ];
      localStorage.setItem('warehouses', JSON.stringify(initialWarehouses));
    }
  }

  private getList<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveList<T>(key: string, list: T[]): void {
    localStorage.setItem(key, JSON.stringify(list));
  }

  // Generic CRUD Helper
  private addRecord<T extends { id: number }>(key: string, record: T): T {
    const list = this.getList<T>(key);
    const maxId = list.reduce((max, r) => r.id > max ? r.id : max, 0);
    record.id = maxId + 1;
    list.push(record);
    this.saveList(key, list);
    return record;
  }

  private updateRecord<T extends { id: number }>(key: string, record: T): T {
    const list = this.getList<T>(key);
    const idx = list.findIndex(r => r.id === record.id);
    if (idx !== -1) {
      list[idx] = record;
      this.saveList(key, list);
    }
    return record;
  }

  private deleteRecord<T extends { id: number }>(key: string, id: number): void {
    let list = this.getList<T>(key);
    list = list.filter(r => r.id !== id);
    this.saveList(key, list);
  }

  // --- Users ---
  getUsers(): Observable<User[]> { return of(this.getList<User>('users')); }
  addUser(user: User): Observable<User> { return of(this.addRecord<User>('users', user)); }
  updateUser(user: User): Observable<User> { return of(this.updateRecord<User>('users', user)); }
  deleteUser(id: number): Observable<void> { this.deleteRecord<User>('users', id); return of(void 0); }

  // --- Invoices (Sales Invoices) ---
  getInvoices(): Observable<Invoice[]> { return of(this.getList<Invoice>('invoices')); }
  addInvoice(invoice: Invoice): Observable<Invoice> { return of(this.addRecord<Invoice>('invoices', invoice)); }
  updateInvoice(invoice: Invoice): Observable<Invoice> { return of(this.updateRecord<Invoice>('invoices', invoice)); }
  deleteInvoice(id: number): Observable<void> { this.deleteRecord<Invoice>('invoices', id); return of(void 0); }

  // --- Companies (Customers) ---
  getCompanies(): Observable<Company[]> { return of(this.getList<Company>('companies')); }
  addCompany(company: Company): Observable<Company> { return of(this.addRecord<Company>('companies', company)); }
  updateCompany(company: Company): Observable<Company> { return of(this.updateRecord<Company>('companies', company)); }
  deleteCompany(id: number): Observable<void> { this.deleteRecord<Company>('companies', id); return of(void 0); }

  // --- Contacts ---
  getContacts(): Observable<Contact[]> { return of(this.getList<Contact>('contacts')); }
  addContact(contact: Contact): Observable<Contact> { return of(this.addRecord<Contact>('contacts', contact)); }
  updateContact(contact: Contact): Observable<Contact> { return of(this.updateRecord<Contact>('contacts', contact)); }
  deleteContact(id: number): Observable<void> { this.deleteRecord<Contact>('contacts', id); return of(void 0); }

  // --- Items (Products) ---
  getItems(): Observable<Item[]> { return of(this.getList<Item>('items')); }
  addItem(item: Item): Observable<Item> { return of(this.addRecord<Item>('items', item)); }
  updateItem(item: Item): Observable<Item> { return of(this.updateRecord<Item>('items', item)); }
  deleteItem(id: number): Observable<void> { this.deleteRecord<Item>('items', id); return of(void 0); }

  // --- Quotations ---
  getQuotations(): Observable<Quotation[]> { return of(this.getList<Quotation>('quotations')); }
  addQuotation(quotation: Quotation): Observable<Quotation> { return of(this.addRecord<Quotation>('quotations', quotation)); }
  updateQuotation(quotation: Quotation): Observable<Quotation> { return of(this.updateRecord<Quotation>('quotations', quotation)); }
  deleteQuotation(id: number): Observable<void> { this.deleteRecord<Quotation>('quotations', id); return of(void 0); }

  // --- Suppliers (New) ---
  getSuppliers(): Observable<Supplier[]> { return of(this.getList<Supplier>('suppliers')); }
  addSupplier(supplier: Supplier): Observable<Supplier> { return of(this.addRecord<Supplier>('suppliers', supplier)); }
  updateSupplier(supplier: Supplier): Observable<Supplier> { return of(this.updateRecord<Supplier>('suppliers', supplier)); }
  deleteSupplier(id: number): Observable<void> { this.deleteRecord<Supplier>('suppliers', id); return of(void 0); }

  // --- Purchase Invoices (New) ---
  getPurchaseInvoices(): Observable<PurchaseInvoice[]> { return of(this.getList<PurchaseInvoice>('purchaseInvoices')); }
  addPurchaseInvoice(inv: PurchaseInvoice): Observable<PurchaseInvoice> { return of(this.addRecord<PurchaseInvoice>('purchaseInvoices', inv)); }
  updatePurchaseInvoice(inv: PurchaseInvoice): Observable<PurchaseInvoice> { return of(this.updateRecord<PurchaseInvoice>('purchaseInvoices', inv)); }
  deletePurchaseInvoice(id: number): Observable<void> { this.deleteRecord<PurchaseInvoice>('purchaseInvoices', id); return of(void 0); }

  // --- Returns (New) ---
  getReturns(): Observable<ReturnRecord[]> { return of(this.getList<ReturnRecord>('returns')); }
  addReturn(ret: ReturnRecord): Observable<ReturnRecord> { return of(this.addRecord<ReturnRecord>('returns', ret)); }
  deleteReturn(id: number): Observable<void> { this.deleteRecord<ReturnRecord>('returns', id); return of(void 0); }

  // --- Stock Inward & Outward (New) ---
  getStockRecords(): Observable<StockRecord[]> { return of(this.getList<StockRecord>('stockRecords')); }
  addStockRecord(rec: StockRecord): Observable<StockRecord> { return of(this.addRecord<StockRecord>('stockRecords', rec)); }
  deleteStockRecord(id: number): Observable<void> { this.deleteRecord<StockRecord>('stockRecords', id); return of(void 0); }

  // --- Warehouses (New) ---
  getWarehouses(): Observable<Warehouse[]> { return of(this.getList<Warehouse>('warehouses')); }
  addWarehouse(wh: Warehouse): Observable<Warehouse> { return of(this.addRecord<Warehouse>('warehouses', wh)); }
  updateWarehouse(wh: Warehouse): Observable<Warehouse> { return of(this.updateRecord<Warehouse>('warehouses', wh)); }
  deleteWarehouse(id: number): Observable<void> { this.deleteRecord<Warehouse>('warehouses', id); return of(void 0); }
}
