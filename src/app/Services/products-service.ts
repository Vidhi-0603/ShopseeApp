import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, switchMap, tap } from 'rxjs';
import { Auth } from './auth';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;

  dimensions: {
    width: number;
    height: number;
    depth: number;
  };

  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: {
    rating: number;
    comment: string;
    date: Date;
    reviewerName: string;
    reviewerEmail: string;
  }[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: {
    createdAt: Date;
    updatedAt: Date;
    barcode: string;
    qrCode: string;
  };
  thumbnail: string;
  images: string[];
}

export interface SearchResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private wishlistSubject = new BehaviorSubject<any[]>([]);
  wishlist$ = this.wishlistSubject.asObservable();

  private cartSubject = new BehaviorSubject<any[]>([]);
  cart$ = this.cartSubject.asObservable();

  private wishlistIds = new BehaviorSubject<number[]>([]);
  wishlistIds$ = this.wishlistIds.asObservable();

  private base_Url = environment.firebase.databaseURL;

  private searchTermSubject = new BehaviorSubject<string>(localStorage.getItem('searchTerm') || '');
  searchTerm$ = this.searchTermSubject.asObservable();

  constructor(private http: HttpClient, private auth: Auth, private router: Router) {}

  // 🔎 Search term management
  setSearchTerm(term: string) {
    localStorage.setItem('searchTerm', term);
    this.searchTermSubject.next(term);
  }

  getSearchTerm(): string {
    return this.searchTermSubject.value;
  }

  // =============================
  // 📌 Wishlist methods
  // =============================
  loadWishlist(): void {
    const uid = this.auth.user.value?.Uid;
    if (!uid) return;

    this.displayWishlist(uid).subscribe({
      next: data => {
        const ids = (data || []).map((item: any) => item.id);
        this.wishlistIds.next(ids);
      },
      error: err => console.error('❌ Failed to load wishlist:', err)
    });
  }

  addToWishlist(product: any, uid: string) {
    return this.auth.getValidToken().pipe(
      switchMap(token => {
        if (!token) throw new Error('❌ No valid token');
        return this.http.put(
          `${this.base_Url}/users/${uid}/wishlist/${product.id}.json?auth=${token}`,
          product
        );
      }),
      tap(() => {
        const updated = [...this.wishlistIds.value, product.id];
        this.wishlistIds.next(updated);
      })
    );
  }

  displayWishlist(uid: string) {
    return this.auth.getValidToken().pipe(
      switchMap(token => {
        if (!token) throw new Error('❌ No valid token');
        console.log("token", token);
        return this.http.get(`${this.base_Url}/users/${uid}/wishlist.json?auth=${token}`);
        
      }),
      map((data: any) => (data ? Object.values(data) : [])),
      tap(wishlist => this.wishlistSubject.next(wishlist))
    );
  }

  removeFromWishlist(productId: number, uid: string) {
    return this.auth.getValidToken().pipe(
      switchMap(token => {
        if (!token) throw new Error('❌ No valid token');
        return this.http.delete(`${this.base_Url}/users/${uid}/wishlist/${productId}.json?auth=${token}`);
      }),
      switchMap(() => this.displayWishlist(uid))
    );
  }

  clearWishlist() {
    this.wishlistIds.next([]);
    this.wishlistSubject.next([]);
  }

  // =============================
  // 🛒 Cart methods
  // =============================
  loadCart(): void {
    const uid = this.auth.user.value?.Uid;
    if (!uid) return;

    this.displayCart(uid).subscribe({
      next: cart => console.log('✅ Cart loaded:', cart),
      error: err => console.error('❌ Failed to load cart:', err)
    });
  }

  addToCart(product: any, uid: string) {
    return this.auth.getValidToken().pipe(
      switchMap(token => {
        if (!token) throw new Error('❌ No valid token');
        const cartItemUrl = `${this.base_Url}/users/${uid}/cart/${product.id}.json?auth=${token}`;
        return this.http.get<any>(cartItemUrl).pipe(
          switchMap(existingProduct => {
            let updatedProduct;
            if (existingProduct) {
              const newQuantity = (existingProduct.quantity || 1) + 1;
              updatedProduct = {
                ...existingProduct,
                quantity: newQuantity,
                totalPrice: newQuantity * existingProduct.price
              };
            } else {
              updatedProduct = {
                ...product,
                quantity: 1,
                totalPrice: product.price
              };
            }
            return this.http.put(cartItemUrl, updatedProduct);
          })
        );
      })
    );
  }

  displayCart(uid: string) {
    return this.auth.getValidToken().pipe(
      switchMap(token => {
        if (!token) throw new Error('❌ No valid token');
        return this.http.get(`${this.base_Url}/users/${uid}/cart.json?auth=${token}`);
      }),
      map((data: any) => (data ? Object.values(data) : [])),
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeFromCart(productId: number, uid: string) {
    return this.auth.getValidToken().pipe(
      switchMap(token => {
        if (!token) throw new Error('❌ No valid token');
        return this.http.delete(`${this.base_Url}/users/${uid}/cart/${productId}.json?auth=${token}`);
      }),
      switchMap(() => this.displayCart(uid))
    );
  }

  // =============================
  // 🔎 Search methods
  // =============================
  searchProducts(query: string, limit: number = 5): Observable<SearchResponse> {
    if (!query.trim()) {
      this.router.navigate(['/home']);
    }
    return this.http.get<SearchResponse>(
      `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  getDefaultProducts(): Observable<any> {
    return this.http.get('https://dummyjson.com/products?limit=10');
  }

  getSuggestions(query: string) {
    if (!query.trim()) {
      return of([]);
    }
    return this.searchProducts(query, 5).pipe(
      map(response => response.products.map(product => product.title))
    );
  }
}
