import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Enquiry } from '../models';

@Injectable({ providedIn: 'root' })
export class EnquiryService {
  private apiUrl = 'http://localhost:3001/enquiries';

  constructor(private http: HttpClient) { }

  getEnquiries(): Observable<Enquiry[]> {
    return this.http.get<Enquiry[]>(this.apiUrl);
  }

  getEnquiryById(id: number): Observable<Enquiry> {
    return this.http.get<Enquiry>(`${this.apiUrl}/${id}`);
  }

  addEnquiry(enquiry: Enquiry): Observable<Enquiry> {
    return this.http.post<Enquiry>(this.apiUrl, enquiry);
  }

  updateEnquiry(id: number, enquiry: Partial<Enquiry>): Observable<Enquiry> {
    return this.http.patch<Enquiry>(`${this.apiUrl}/${id}`, enquiry);
  }

  deleteEnquiry(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
