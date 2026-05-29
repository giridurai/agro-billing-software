import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User, Invoice, Company, Contact, Item, Quotation, Supplier, PurchaseInvoice, ReturnRecord, StockRecord, Warehouse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {
    this.initLocalStorage();
  }

  private initLocalStorage() {
    // 1. Initial Users
    // 1. Initial Users
    const existingUsersRaw = localStorage.getItem('users');
    let needsReset = false;
    if (existingUsersRaw) {
      try {
        const list = JSON.parse(existingUsersRaw);
        if (list.length > 0 && list[0].firstName === 'Admin' && list[0].lastName === 'User') {
          needsReset = true;
        }
      } catch (e) {
        needsReset = true;
      }
    }
    if (!existingUsersRaw || needsReset) {
      const initialUsers: User[] = [
        { id: 1, firstName: 'Ramesh Patil', lastName: '(Owner)', joiningDate: '2025-01-01', email: 'crm@crm.com', phoneNumber: '+91 9848011111', gender: 'Male', role: 'Admin', username: 'admin_ramesh', status: 'Active', isOwner: true },
        { id: 2, firstName: 'Suresh Rao', lastName: '(Sales)', joiningDate: '2025-02-15', email: 'suresh@puvilink.com', phoneNumber: '+91 8891002222', gender: 'Male', role: 'Sales Executive', username: 'suresh_sales', status: 'Active', isOwner: false },
        { id: 3, firstName: 'Anil Kumar', lastName: '(Billing Counter)', joiningDate: '2025-03-10', email: 'anil@puvilink.com', phoneNumber: '+91 7702113333', gender: 'Male', role: 'Billing', username: 'anil_billing', status: 'Active', isOwner: false },
        { id: 4, firstName: 'CA Verma', lastName: '(Audits)', joiningDate: '2025-04-01', email: 'verma@puvilink.com', phoneNumber: '+91 9440155555', gender: 'Male', role: 'Auditor', username: 'verma_auditor', status: 'Active', isOwner: false }
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
        { id: 1, companyName: 'Rajesh Kumar (Farmer)', pan: '', gst: 'Not Applicable', contactNumber: '9848011223', email: 'rajesh@farmer.org', contactPerson: 'Rajesh Kumar', status: 'Active', industryType: 'Farmer', billingAddress: 'Anantapur Rural, AP', shippingAddress: 'Anantapur Rural, AP', aadhaar: '4512-9981-0023', creditBalance: 12000, maxCreditLimit: 30000 },
        { id: 2, companyName: 'Balaji Agro Traders', pan: 'ABCFG1234F', gst: '37ABCFG1234F1Z9', contactNumber: '8891002233', email: 'balaji@traders.com', contactPerson: 'Balaji Prasad', status: 'Active', industryType: 'Dealer', billingAddress: 'Guntur Market Yard, AP', shippingAddress: 'Guntur Market Yard, AP', aadhaar: 'No Aadhaar Verification', creditBalance: 45000, maxCreditLimit: 150000 },
        { id: 3, companyName: 'Srinivas Reddy (Farmer)', pan: '', gst: 'Not Applicable', contactNumber: '7702114455', email: 'srinivas@farmer.org', contactPerson: 'Srinivas Reddy', status: 'Active', industryType: 'Farmer', billingAddress: 'Tadipatri, AP', shippingAddress: 'Tadipatri, AP', aadhaar: '8912-7744-1122', creditBalance: 0, maxCreditLimit: 25000 },
        { id: 4, companyName: 'Naidu Agro Inputs', pan: 'AHKPR5512B', gst: '37AHKPR5512B1ZX', contactNumber: '9440112233', email: 'naidu@agroinputs.com', contactPerson: 'Naidu Swamy', status: 'Active', industryType: 'Dealer', billingAddress: 'Vijayawada Road, AP', shippingAddress: 'Vijayawada Road, AP', aadhaar: 'No Aadhaar Verification', creditBalance: 125400, maxCreditLimit: 200000 }
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
          invoiceNo: 'INV-2026-0001',
          orderNo: 'ORD-2026-001',
          customerName: 'Rajesh Kumar (Farmer)',
          customerGSTIN: 'Not Applicable',
          billingAddress: 'Anantapur Rural, AP',
          status: 'Paid',
          dueDate: '2026-05-28',
          amount: 17955,
          balanceDue: 0,
          vehicleNo: 'AP-02-TZ-1234',
          items: [
            { name: 'Premium NPK Fertilizer 19-19-19', quantity: 15, rate: 1200, cgst: 2.5, sgst: 2.5, discount: 5, amount: 17955, hsnCode: '3105' }
          ]
        }
      ];
      localStorage.setItem('invoices', JSON.stringify(initialInvoices));
    }

    // 7. Initial Suppliers
    if (!localStorage.getItem('suppliers')) {
      const initialSuppliers: Supplier[] = [
        { id: 1, supplierName: 'IFFCO Fertilizer Corp Ltd', contactNumber: '1800-103-1967', address: 'New Delhi HQ, India (Contact: Amit Sharma)', gstNumber: '07AAACI0468G1Z1' },
        { id: 2, supplierName: 'Coromandel International Ltd', contactNumber: '040-27842034', address: 'Secunderabad, Telangana (Contact: R. K. Prasad)', gstNumber: '36AAACC0925G2Z3' },
        { id: 3, supplierName: 'Tata Rallis India Ltd', contactNumber: '022-66652222', address: 'Mumbai, Maharashtra (Contact: Manoj Deshmukh)', gstNumber: '27AAACR1234M1Z4' }
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

  // Local Storage Mutation helpers
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

  // --- HTTP JSON-SERVER SYNCHRONIZER HELPERS ---
  private getRecords<T extends { id: number }>(key: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${key}`).pipe(
      map(data => {
        const localList = this.getList<T>(key);
        if ((!data || data.length === 0) && localList.length > 0) {
          // Local storage has items but server is clean - Seed server
          localList.forEach(item => {
            this.http.post(`${this.baseUrl}/${key}`, item).subscribe({
              error: (err) => console.warn(`Failed to seed ${key} item:`, err)
            });
          });
          return localList;
        }
        if (data && data.length > 0) {
          this.saveList(key, data);
        }
        return data || [];
      }),
      catchError(() => {
        // Offline: fallback to localStorage cache
        return of(this.getList<T>(key));
      })
    );
  }

  private addRecordHttp<T extends { id: number }>(key: string, record: T): Observable<T> {
    const local = this.addRecord<T>(key, record);
    return this.http.post<T>(`${this.baseUrl}/${key}`, local).pipe(
      catchError(() => of(local))
    );
  }

  private updateRecordHttp<T extends { id: number }>(key: string, record: T): Observable<T> {
    const local = this.updateRecord<T>(key, record);
    return this.http.put<T>(`${this.baseUrl}/${key}/${record.id}`, local).pipe(
      catchError(() => of(local))
    );
  }

  private deleteRecordHttp<T extends { id: number }>(key: string, id: number): Observable<void> {
    this.deleteRecord<T>(key, id);
    return this.http.delete<void>(`${this.baseUrl}/${key}/${id}`).pipe(
      catchError(() => of(void 0))
    );
  }

  // --- Users ---
  getUsers(): Observable<User[]> { return this.getRecords<User>('users'); }
  addUser(user: User): Observable<User> { return this.addRecordHttp<User>('users', user); }
  updateUser(user: User): Observable<User> { return this.updateRecordHttp<User>('users', user); }
  deleteUser(id: number): Observable<void> { return this.deleteRecordHttp<User>('users', id); }

  // --- Invoices (Sales Invoices) ---
  getInvoices(): Observable<Invoice[]> { return this.getRecords<Invoice>('invoices'); }
  addInvoice(invoice: Invoice): Observable<Invoice> { return this.addRecordHttp<Invoice>('invoices', invoice); }
  updateInvoice(invoice: Invoice): Observable<Invoice> { return this.updateRecordHttp<Invoice>('invoices', invoice); }
  deleteInvoice(id: number): Observable<void> { return this.deleteRecordHttp<Invoice>('invoices', id); }

  // --- Companies (Customers) ---
  getCompanies(): Observable<Company[]> { return this.getRecords<Company>('companies'); }
  addCompany(company: Company): Observable<Company> { return this.addRecordHttp<Company>('companies', company); }
  updateCompany(company: Company): Observable<Company> { return this.updateRecordHttp<Company>('companies', company); }
  deleteCompany(id: number): Observable<void> { return this.deleteRecordHttp<Company>('companies', id); }

  // --- Contacts ---
  getContacts(): Observable<Contact[]> { return this.getRecords<Contact>('contacts'); }
  addContact(contact: Contact): Observable<Contact> { return this.addRecordHttp<Contact>('contacts', contact); }
  updateContact(contact: Contact): Observable<Contact> { return this.updateRecordHttp<Contact>('contacts', contact); }
  deleteContact(id: number): Observable<void> { return this.deleteRecordHttp<Contact>('contacts', id); }

  // --- Items (Products) ---
  getItems(): Observable<Item[]> { return this.getRecords<Item>('items'); }
  addItem(item: Item): Observable<Item> { return this.addRecordHttp<Item>('items', item); }
  updateItem(item: Item): Observable<Item> { return this.updateRecordHttp<Item>('items', item); }
  deleteItem(id: number): Observable<void> { return this.deleteRecordHttp<Item>('items', id); }

  // --- Quotations ---
  getQuotations(): Observable<Quotation[]> { return this.getRecords<Quotation>('quotations'); }
  addQuotation(quotation: Quotation): Observable<Quotation> { return this.addRecordHttp<Quotation>('quotations', quotation); }
  updateQuotation(quotation: Quotation): Observable<Quotation> { return this.updateRecordHttp<Quotation>('quotations', quotation); }
  deleteQuotation(id: number): Observable<void> { return this.deleteRecordHttp<Quotation>('quotations', id); }

  // --- Suppliers ---
  getSuppliers(): Observable<Supplier[]> { return this.getRecords<Supplier>('suppliers'); }
  addSupplier(supplier: Supplier): Observable<Supplier> { return this.addRecordHttp<Supplier>('suppliers', supplier); }
  updateSupplier(supplier: Supplier): Observable<Supplier> { return this.updateRecordHttp<Supplier>('suppliers', supplier); }
  deleteSupplier(id: number): Observable<void> { return this.deleteRecordHttp<Supplier>('suppliers', id); }

  // --- Purchase Invoices ---
  getPurchaseInvoices(): Observable<PurchaseInvoice[]> { return this.getRecords<PurchaseInvoice>('purchaseInvoices'); }
  addPurchaseInvoice(inv: PurchaseInvoice): Observable<PurchaseInvoice> { return this.addRecordHttp<PurchaseInvoice>('purchaseInvoices', inv); }
  updatePurchaseInvoice(inv: PurchaseInvoice): Observable<PurchaseInvoice> { return this.updateRecordHttp<PurchaseInvoice>('purchaseInvoices', inv); }
  deletePurchaseInvoice(id: number): Observable<void> { return this.deleteRecordHttp<PurchaseInvoice>('purchaseInvoices', id); }

  // --- Returns ---
  getReturns(): Observable<ReturnRecord[]> { return this.getRecords<ReturnRecord>('returns'); }
  addReturn(ret: ReturnRecord): Observable<ReturnRecord> { return this.addRecordHttp<ReturnRecord>('returns', ret); }
  deleteReturn(id: number): Observable<void> { return this.deleteRecordHttp<ReturnRecord>('returns', id); }

  // --- Stock Inward & Outward ---
  getStockRecords(): Observable<StockRecord[]> { return this.getRecords<StockRecord>('stockRecords'); }
  addStockRecord(rec: StockRecord): Observable<StockRecord> { return this.addRecordHttp<StockRecord>('stockRecords', rec); }
  deleteStockRecord(id: number): Observable<void> { return this.deleteRecordHttp<StockRecord>('stockRecords', id); }

  // --- Warehouses ---
  getWarehouses(): Observable<Warehouse[]> { return this.getRecords<Warehouse>('warehouses'); }
  addWarehouse(wh: Warehouse): Observable<Warehouse> { return this.addRecordHttp<Warehouse>('warehouses', wh); }
  updateWarehouse(wh: Warehouse): Observable<Warehouse> { return this.updateRecordHttp<Warehouse>('warehouses', wh); }
  deleteWarehouse(id: number): Observable<void> { return this.deleteRecordHttp<Warehouse>('warehouses', id); }
}
