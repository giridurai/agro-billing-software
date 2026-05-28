import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Item } from './models';

@Injectable({
  providedIn: 'root',
})
export class Iteams {
  private items: Item[] = [];

  constructor(private http: HttpClient) {
    this.loadItems();
  }

  private loadItems() {
    this.http.get<Item[]>('data/items.json').subscribe(data => {
      this.items = data;
    });
  }

  // To support components that expect immediate array (synchronous)
  // Note: This might be empty if the JSON hasn't loaded yet. 
  // Better to use Observable, but fixing existing code with minimal friction.
  getItems(): Item[] {
    return this.items;
  }

  getItemByName(name: string): Item | null {
    return this.items.find((i) => i.name.toLowerCase() === name.toLowerCase()) || null;
  }

  // Providing an observable version for better practice
  getItemsAsync(): Observable<Item[]> {
    return this.http.get<Item[]>('data/items.json').pipe(
      tap(data => this.items = data)
    );
  }
}
