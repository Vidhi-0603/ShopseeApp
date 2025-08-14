import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Redirect {
  private action : {route: string, params?: any, productId?:number} | null = null;

  setRedirect(route: string, params?: any, productId?: number) {
    this.action = { route, params , productId };
  }

  getRedirect() {
    return this.action;
  }

  clear() {
    this.action = null;
  }
}
