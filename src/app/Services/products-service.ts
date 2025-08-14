import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { Auth } from './auth';
import { Router } from '@angular/router';

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
  weight:number;

  dimensions:{
    width: number,
    height: number,
    depth: number
  };

  warrantyInformation:string;
  shippingInformation:string;
  availabilityStatus:string;
  reviews:{
    rating:number,
    comment:string,
    date:Date,
    reviewerName:string,
    reviewerEmail:string
  }[]
  returnPolicy:string;
  minimumOrderQuantity: number,
  meta:{
    createdAt: Date,
    updatedAt: Date,
    barcode: string,
    qrCode: string
  }
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

  constructor(private http: HttpClient, private auth: Auth, private router: Router) {}

  private base_Url = "https://shopseeapp-default-rtdb.firebaseio.com/";

  // Call this once after login

  private searchTermSubject = new BehaviorSubject<string>(localStorage.getItem('searchTerm') || '');
  searchTerm$ = this.searchTermSubject.asObservable();

  setSearchTerm(term: string) {
    localStorage.setItem('searchTerm', term);
    this.searchTermSubject.next(term);
  } 

  getSearchTerm(): string {
    return this.searchTermSubject.value;
  }

  loadWishlist(): void {
    if (!this.auth.user.value?.Uid || !this.auth.user.value?.token) return;

    const uid = this.auth.user.value.Uid;
    const token = this.auth.user.value.token;

    this.displayWishlist(uid,token).subscribe(data => {
      const ids = Object.values(data || {}).map(item => item.id);
      this.wishlistIds.next(ids);
    });
  }

  addToWishlist(product: any, uid: string, idToken: string) {
    return this.http.put(`${this.base_Url}/users/${uid}/wishlist/${product.id}.json?auth=${idToken}`, product).pipe(
      switchMap(() => {
        const updated = [...this.wishlistIds.value, product.id];
        this.wishlistIds.next(updated);
        return of();
      })
    );;
  }

  addToCart(product: any, Uid:string,idToken: string){

    const cartItemUrl = `${this.base_Url}/users/${Uid}/cart/${product.id}.json?auth=${idToken}`;

    return this.http.get<any>(cartItemUrl).pipe(
      switchMap(existingProduct => {
        let updatedProduct;

        if (existingProduct) {
          // Product exists → increment quantity
          const newQuantity = (existingProduct.quantity || 1) + 1;
          updatedProduct = {
            ...existingProduct,
            quantity: newQuantity,
            totalPrice: newQuantity * existingProduct.price
          };
        } else {
          // Product doesn't exist → add with quantity: 1
          updatedProduct = {
            ...product,
            quantity: 1,
            totalPrice: product.price
          };
        }

        return this.http.put(cartItemUrl, updatedProduct);
      })
    );

  }

  displayWishlist(Uid: string, idToken : string) {
    return this.http.get(`${this.base_Url}/users/${Uid}/wishlist.json?auth=${idToken}`).pipe(
      map(data => data ? Object.values(data) : []),
      tap(wishlist => this.wishlistSubject.next(wishlist)) // broadcast the data
    );
  }

  displayCart(Uid: string, idToken : string){
    return this.http.get(`${this.base_Url}/users/${Uid}/cart.json?auth=${idToken}`).pipe(
      map(data => data ? Object.values(data) : []),
      tap(cart => this.cartSubject.next(cart)) // broadcast the data
    );
  }

  removeFromWishlist(productId: number, uid: string, idToken: string) {
  return this.http.delete(`${this.base_Url}/users/${uid}/wishlist/${productId}.json?auth=${idToken}`).pipe(
    switchMap(() => {
      // Optionally update wishlistIds if needed
      const updated = this.wishlistIds.value.filter(id => id !== productId);
      this.wishlistIds.next(updated);

      // Now fetch the updated wishlist from backend
      return this.http.get(`${this.base_Url}/users/${uid}/wishlist.json?auth=${idToken}`);
    }),
    map(data => data ? Object.values(data) : []),
    tap((updatedWishlist) => {
      this.wishlistSubject.next(updatedWishlist); // ✅ broadcast to UI
    })
  );
}

  removeFromCart(productId:number, Uid: string, idToken :string){
    return this.http.delete(`${this.base_Url}/users/${Uid}/cart/${productId}.json?auth=${idToken}`);
  }


  clearWishlist() {
  this.wishlistIds.next([]);
  this.wishlistSubject.next([]); // If you also use full wishlistProduct objects
}

  searchProducts(query: string, limit: number = 5): Observable<SearchResponse>{
    if(!query.trim()){
      this.router.navigate(['/home']);
    }
    return this.http.get<SearchResponse>(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  getDefaultProducts(): Observable<any> {
    return this.http.get('https://dummyjson.com/products?limit=10');
  }

  getSuggestions(query: string){
    if(!query.trim()){
      return of([])
    }
    return this.searchProducts(query, 5).pipe(
      map(response => response.products.map(product => product.title))
    );
  }
}
