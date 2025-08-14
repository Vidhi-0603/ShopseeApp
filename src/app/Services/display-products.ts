import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DisplayProducts {

  private baseUrl = 'https://dummyjson.com/products/category';
  constructor(private http: HttpClient){}

  // displaySmartPhones() :Observable<any> {
  //   return this.http.get(`${this.baseUrl}/smartphones?sortBy=rating&order=asc`);
  // }

  getProducts():Observable<any[]>{
    return this.http.get<any>("https://dummyjson.com/products?limit=200").pipe(map(res => res.products));
  }
  
  getProductsByCategory(category: string | string[]): Observable<{[category: string]: any[]}>{
    if(typeof category === 'string'){
      return this.http.get<any>(`${this.baseUrl}/${category}`).pipe(
        map(res => ({[category]:res.products || []}))
      );
    }

    const requests = category.map(cat =>{
      return this.http.get<any>(`${this.baseUrl}/${cat}`).pipe(
        map(res => ({category : cat , products : res.products || []}))
      )
    });

    return forkJoin(requests).pipe(
      map(results => {
        const resultMap: { [category: string]: any[] } = {};
        results.forEach(res =>{
          resultMap[res.category] = res.products;
        });
        return resultMap;
      })
    );
  }

  viewProductDetails(id: number): Observable<any> {
    return this.http.get<any>(`https://dummyjson.com/products/${id}`);
  }
  
}
