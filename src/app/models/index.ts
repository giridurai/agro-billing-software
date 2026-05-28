export interface User {
  id: number;
  firstName: string;
  lastName: string;
  joiningDate: string;
  email: string;
  phoneNumber: string;
  gender: string;
  role: string;
  password?: string;
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  rate: number;
  cgst: number;
  sgst: number;
  taxableValue?: number;
  amount: number;
  hsnCode: string;
  discount?: number;
}

export interface Invoice {
  id: number;
  invoiceNo: string;
  orderNo: string;
  customerName: string;
  customerGSTIN?: string;
  billingAddress?: string;
  reverseCharge?: string;
  state?: string;
  stateCode?: string;
  status: string;
  dueDate: string;
  amount: number;
  balanceDue: number;
  forwardingCharges?: number;
  packingCharges?: number;
  insuranceCharges?: number;
  gstReverseCharge?: number;
  termsConditions?: string;
  vehicleNo?: string;
  items: InvoiceItem[];
}

export interface Enquiry {
  id?: number;
  enquiryNo: string;
  userId?: string;
  enquiryDate: string;
  companyName: string;
  mobileNumber: string;
  source: string;
  type: string;
  assignedTo: string;
  actionType: string;
  priority: 'High' | 'Medium' | 'Low';
  status: string;
}

export interface QuotationItem {
  name: string;
  quantity: number;
  rate: number;
  cgst: number;
  sgst: number;
  amount: number;
  hsnCode: string;
  discount: number;
}

export interface Quotation {
  id: number;
  quotationNo: string;
  referenceNo: string;
  companyName: string;
  lineitems?: any[];
  termsconditions?: string;
  contact: string;
  quotationDate: string;
  expiryDate: string;
  status: string;
  iteams: QuotationItem[];
  amount: number;
}

export interface Company {
  id: number;
  companyName: string;
  pan: string;
  gst: string;
  contactNumber: string;
  email: string;
  contactPerson: string;
  status?: string;
  industryType?: string;
  shippingAddress?: string;
  billingAddress?: string;
}

export interface Contact {
  id: number;
  contactName: string;
  contact: string;
  email: string;
  designation: string;
  department: string;
  linkedCompany: string;
}

export interface Item {
  id: number;
  name: string;
  description?: string;
  rate: number;
  cgst: number;
  sgst: number;
  hsnCode: string;
  discount: number;
  category?: string;
  unit?: string;
  stockQuantity?: number;
}

export interface Supplier {
  id: number;
  supplierName: string;
  contactNumber: string;
  address: string;
  gstNumber: string;
}

export interface PurchaseInvoiceItem {
  name: string;
  quantity: number;
  rate: number;
  cgst: number;
  sgst: number;
  amount: number;
}

export interface PurchaseInvoice {
  id: number;
  invoiceNo: string;
  supplierName: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  items: PurchaseInvoiceItem[];
}

export interface ReturnRecord {
  id: number;
  returnNumber: string;
  product: string;
  quantity: number;
  reason: string;
  date: string;
}

export interface StockRecord {
  id: number;
  product: string;
  quantity: number;
  date: string;
  type: 'Inward' | 'Outward';
  notes?: string;
}

export interface Warehouse {
  id: number;
  warehouseName: string;
  location: string;
  capacity: number;
}

