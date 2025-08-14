import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface FilterCriteria {
  minPrice: number;
  maxPrice: number;
  minRating: number;
  selectedBrands: string[];
  inStockOnly: boolean;
  returnPolicyTypes: string[];
  categories: string[];
}
@Injectable({
  providedIn: 'root'
})
export class ProductsFilter {
  // private readonly API_URL = 'https://dummyjson.com/products';

  private allProductsSubject = new BehaviorSubject<{[category: string]: Product[]}>({'':[]});
  private filteredProductsSubject = new BehaviorSubject<Product[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private filtersSubject = new BehaviorSubject<FilterCriteria>({
    minPrice: 0,
    maxPrice: 10000,
    minRating: 0,
    selectedBrands: [],
    inStockOnly: false,
    returnPolicyTypes: [],
    categories: []
  });

  public allProducts$ = this.allProductsSubject.asObservable();
  public filteredProducts$ = this.filteredProductsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public filters$ = this.filtersSubject.asObservable();

  constructor(private http: HttpClient) {
    // this.loadProducts();
  }

  loadProducts(products:{[category: string]: Product[]}): void {

  if(products){
    this.allProductsSubject.next(products);
    this.filteredProductsSubject.next([]);
    this.loadingSubject.next(false);
    this.applyFilters(this.filtersSubject.value);
  }
  
    
  }
  updateFilters(newFilters: Partial<FilterCriteria>): void {
    const currentFilters = this.filtersSubject.value;
    const updatedFilters = { ...currentFilters, ...newFilters };
    this.filtersSubject.next(updatedFilters);
    this.applyFilters(updatedFilters);
  }

  private applyFilters(filters: FilterCriteria): void {
    const allProductsObject = this.allProductsSubject.value;
    
    const isDefaultFilter = 
    filters.minPrice === this.getPriceRange().min &&
    filters.maxPrice === this.getPriceRange().max &&
    filters.minRating === 0 &&
    filters.selectedBrands.length === 0 &&
    filters.categories.length === 0 &&
    filters.returnPolicyTypes.length === 0 &&
    !filters.inStockOnly;


    let filteredProductsList: Product[] = [];
  
    if (isDefaultFilter) {
      for (const cat of Object.keys(allProductsObject)) {
        filteredProductsList = filteredProductsList.concat(allProductsObject[cat]);
      }
      this.filteredProductsSubject.next(filteredProductsList);
      return;
    }

    console.log('Active filters:', filters);
    console.log('Filtering brand:', filters.selectedBrands);
    console.log('Filtering category:', filters.categories);


    for (const cat of Object.keys(allProductsObject)) {
      let filtered : Product[] = []
      if (allProductsObject[cat].length > 0) {
        const allProducts = allProductsObject[cat];
        filtered = allProducts.filter(product => {

        // Price filter
        if (product.price < filters.minPrice || product.price > filters.maxPrice) {
          return false;
        }

        // Rating filter
        if (product.rating < filters.minRating) {
          return false;
        }

        // Brand filter
        if (filters.selectedBrands.length > 0 && !filters.selectedBrands.includes(product.brand)) {
          return false;
        }

        // Stock availability filter
        if (filters.inStockOnly && product.stock <= 0) {
          return false;
        }

        // Return policy filter
        if (filters.returnPolicyTypes.length > 0) {
          const hasMatchingReturnPolicy = filters.returnPolicyTypes.some(policy => 
            product.returnPolicy.toLowerCase().includes(policy.toLowerCase())
          );
          if (!hasMatchingReturnPolicy) {
            return false;
          }
        }

        // Category filter
        
          if(filters.categories.length > 0 && !filters.categories.includes(product.category)) {
          return false;
        }

      return true;
    });
              
  }
  filteredProductsList = filteredProductsList.concat(filtered);
 }
    
  this.filteredProductsSubject.next(filteredProductsList);


}

  getUniqueValues(property: keyof Product): string[] {
    const allProducts = this.allProductsSubject.value;
    console.log(allProducts)
    let uniqueValues:string[] = []
    for (const cat of Object.keys(allProducts)) {
      const products = allProducts[cat];
      const values = products.map(product => String(product[property]));
      uniqueValues=uniqueValues.concat(values);
    }
    console.log(uniqueValues)
    const cleaned = [...new Set(uniqueValues)].filter(value => value !== '' && value !== 'undefined');

    // const values = allProducts.map(product => String(product[property]));
      console.log(`Cleaned unique values for ${property}:`, cleaned);

    return cleaned.sort();

  }

  getUniqueBrands(): string[] {
    return this.getUniqueValues('brand');
  }

  getUniqueCategories(): string[] {
    return this.getUniqueValues('category');
  }

  getUniqueReturnPolicies(): string[] {
    const allProducts = this.allProductsSubject.value;

    let uniquePolicies:string[] = []
    for (const cat of Object.keys(allProducts)) {
      const products = allProducts[cat];
      const policies = products.map(product => {
        // Extract key terms from return policy
        const policy = product.returnPolicy.toLowerCase();
        if (policy.includes('no return')) return 'No Return';
        if (policy.includes('30 day')) return '30 Days';
        if (policy.includes('60 day')) return '60 Days';
        if (policy.includes('90 day')) return '90 Days';
        if (policy.includes('7 day')) return '7 Days';
        return 'Other';
      });
      uniquePolicies=uniquePolicies.concat(policies);
    }
    
    return [...new Set(uniquePolicies)].sort();
  }

  getPriceRange(): { min: number; max: number } {
    const allProducts = this.allProductsSubject.value;
    if (!allProducts) return { min: 0, max: 1000 };

    let overallPrices:number[] = []
    for (const cat of Object.keys(allProducts)) {
      const products = allProducts[cat];
      if (products.length === 0) return { min: 0, max: 1000 };

      const prices = products.map(p => p.price);     
      overallPrices=overallPrices.concat(prices);
    }

    return {
      min: Math.floor(Math.min(...overallPrices)),
      max: Math.ceil(Math.max(...overallPrices))
    };
  }

  clearFilters(): void {
    const priceRange = this.getPriceRange();
    this.updateFilters({
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      minRating: 0,
      selectedBrands: [],
      inStockOnly: false,
      returnPolicyTypes: [],
      categories: []
    });
  } 
}
