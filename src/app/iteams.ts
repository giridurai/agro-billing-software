import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Item } from './models';

@Injectable({
  providedIn: 'root',
})
export class Iteams {
  private items: Item[] = [];

  constructor() {
    this.loadItems();
  }

  private loadItems() {
    const data = localStorage.getItem('items');
    this.items = data ? JSON.parse(data) : [];
  }

  getItems(): Item[] {
    this.loadItems();
    return this.items;
  }

  getItemByName(name: string): Item | null {
    this.loadItems();
    return this.items.find((i) => i.name.toLowerCase() === name.toLowerCase()) || null;
  }

  getItemsAsync(): Observable<Item[]> {
    this.loadItems();
    return of(this.items);
  }
}
