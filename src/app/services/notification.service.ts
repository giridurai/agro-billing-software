import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: Date;
  type: 'company' | 'user' | 'invoice' | 'quotation' | 'system';
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  
  notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    // Load from local storage if exists
    const saved = localStorage.getItem('crm_notifications');
    if (saved) {
      this.notifications = JSON.parse(saved, (key, value) => {
        if (key === 'time') return new Date(value);
        return value;
      });
      this.notificationsSubject.next(this.notifications);
    }
  }

  addNotification(title: string, message: string, type: Notification['type']) {
    const newNotification: Notification = {
      id: Date.now(),
      title,
      message,
      time: new Date(),
      type,
      read: false
    };

    this.notifications = [newNotification, ...this.notifications].slice(0, 50); // Keep last 50
    this.saveAndNotify();
  }

  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.saveAndNotify();
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  private saveAndNotify() {
    localStorage.setItem('crm_notifications', JSON.stringify(this.notifications));
    this.notificationsSubject.next(this.notifications);
  }

  clearAll() {
    this.notifications = [];
    this.saveAndNotify();
  }
}
