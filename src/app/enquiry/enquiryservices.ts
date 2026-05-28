import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Enquiry } from '../models';

@Injectable({ providedIn: 'root' })
export class EnquiryService {
  constructor() {
    this.initLocalStorage();
  }

  private initLocalStorage() {
    if (!localStorage.getItem('enquiries')) {
      const initial: Enquiry[] = [
        { id: 1, enquiryNo: 'ENQ-2026-001', enquiryDate: '2026-05-10', companyName: 'Annapurna Farmers Cooperative', mobileNumber: '9900887766', source: 'Reference', type: 'Farming Equipment', assignedTo: 'Rajesh Kumar', actionType: 'Call back', priority: 'High', status: 'Converted' }
      ];
      localStorage.setItem('enquiries', JSON.stringify(initial));
    }
  }

  private getList(): Enquiry[] {
    const data = localStorage.getItem('enquiries');
    return data ? JSON.parse(data) : [];
  }

  private saveList(list: Enquiry[]) {
    localStorage.setItem('enquiries', JSON.stringify(list));
  }

  getEnquiries(): Observable<Enquiry[]> {
    return of(this.getList());
  }

  getEnquiryById(id: number): Observable<Enquiry> {
    const item = this.getList().find(e => e.id === id);
    return of(item!);
  }

  addEnquiry(enquiry: Enquiry): Observable<Enquiry> {
    const list = this.getList();
    enquiry.id = list.reduce((max, e) => (e.id || 0) > max ? (e.id || 0) : max, 0) + 1;
    list.push(enquiry);
    this.saveList(list);
    return of(enquiry);
  }

  updateEnquiry(id: number, enquiry: Partial<Enquiry>): Observable<Enquiry> {
    const list = this.getList();
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...enquiry };
      this.saveList(list);
      return of(list[idx]);
    }
    return of(null as any);
  }

  deleteEnquiry(id: number): Observable<any> {
    let list = this.getList();
    list = list.filter(e => e.id !== id);
    this.saveList(list);
    return of(true);
  }
}
