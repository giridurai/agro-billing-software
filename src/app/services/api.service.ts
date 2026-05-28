import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Invoice, Company, Contact, Item, Quotation } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3001';

  constructor(private http: HttpClient) { }

  // Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }
  addUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${user.id}`, user);
  }
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  // Invoices
  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.baseUrl}/invoices`);
  }
  addInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.baseUrl}/invoices`, invoice);
  }
  updateInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.baseUrl}/invoices/${invoice.id}`, invoice);
  }
  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/invoices/${id}`);
  }

  // Companies
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/companies`);
  }
  addCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(`${this.baseUrl}/companies`, company);
  }
  updateCompany(company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/companies/${company.id}`, company);
  }
  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/companies/${id}`);
  }

  // Contacts
  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.baseUrl}/contacts`);
  }
  addContact(contact: Contact): Observable<Contact> {
    return this.http.post<Contact>(`${this.baseUrl}/contacts`, contact);
  }
  updateContact(contact: Contact): Observable<Contact> {
    return this.http.put<Contact>(`${this.baseUrl}/contacts/${contact.id}`, contact);
  }
  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/contacts/${id}`);
  }

  // Items
  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.baseUrl}/items`);
  }
  addItem(item: Item): Observable<Item> {
    return this.http.post<Item>(`${this.baseUrl}/items`, item);
  }
  updateItem(item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.baseUrl}/items/${item.id}`, item);
  }
  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/items/${id}`);
  }

  // Quotations
  getQuotations(): Observable<Quotation[]> {
    return this.http.get<Quotation[]>(`${this.baseUrl}/quotations`);
  }
  addQuotation(quotation: Quotation): Observable<Quotation> {
    return this.http.post<Quotation>(`${this.baseUrl}/quotations`, quotation);
  }
  updateQuotation(quotation: Quotation): Observable<Quotation> {
    return this.http.put<Quotation>(`${this.baseUrl}/quotations/${quotation.id}`, quotation);
  }
  deleteQuotation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/quotations/${id}`);
  }
}
