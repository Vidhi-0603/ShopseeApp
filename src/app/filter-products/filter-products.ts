import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsFilter, FilterCriteria } from '../Services/products-filter';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-filter-products',
  standalone: false,
  templateUrl: './filter-products.html',
  styleUrl: './filter-products.css'
})
export class FilterProducts {

  filters: FilterCriteria = {
    minPrice: 0,
    maxPrice: 10000,
    minRating: 0,
    selectedBrands: [],
    inStockOnly: false,
    returnPolicyTypes: [],
    categories: []
  };

  priceRange = { min: 0, max: 1000 };
  availableBrands: string[] = [];
  availableCategories: string[] = [];
  availableReturnPolicies: string[] = [];
  
  brandSearchTerm = '';
  showAllBrands = false;

  private destroy$ = new Subject<void>();

  constructor(private filterService: ProductsFilter) {}

  ngOnInit(): void {
    // Subscribe to current filters
    this.filterService.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        this.filters = { ...filters };
      });

    // Load available filter options when products are loaded
    this.filterService.allProducts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {
        if (products) {
          for (const cat of Object.keys(products)) {
            if (products[cat].length > 0) {
              this.loadFilterOptions();
              break;
            }
          }
        }else{
          console.log("no products")
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFilterOptions(): void {
    this.availableBrands = this.filterService.getUniqueBrands();
    this.availableCategories = this.filterService.getUniqueCategories();
    this.availableReturnPolicies = this.filterService.getUniqueReturnPolicies();
    this.priceRange = this.filterService.getPriceRange();

    // Initialize filter values if not already set
    if (this.filters.maxPrice === 10000) {
      this.filters.maxPrice = this.priceRange.max;
      this.filters.minPrice = this.priceRange.min;
    }
  }

  onFilterChange(): void {
    this.filterService.updateFilters(this.filters);
  }

  onBrandChange(brand: string, event: any): void {
    if (event.target.checked) {
      this.filters.selectedBrands.push(brand);
    } else {
      const index = this.filters.selectedBrands.indexOf(brand);
      if (index > -1) {
        this.filters.selectedBrands.splice(index, 1);
      }
    }
    this.onFilterChange();
  }

  onCategoryChange(category: string, event: any): void {
    if (event.target.checked) {
      this.filters.categories.push(category);
    } else {
      const index = this.filters.categories.indexOf(category);
      if (index > -1) {
        this.filters.categories.splice(index, 1);
      }
    }
    this.onFilterChange();
  }

  onReturnPolicyChange(policy: string, event: any): void {
    if (event.target.checked) {
      this.filters.returnPolicyTypes.push(policy);
    } else {
      const index = this.filters.returnPolicyTypes.indexOf(policy);
      if (index > -1) {
        this.filters.returnPolicyTypes.splice(index, 1);
      }
    }
    this.onFilterChange();
  }

  getFilteredBrands(): string[] {
    const filtered = this.availableBrands.filter(brand =>
      brand.toLowerCase().includes(this.brandSearchTerm.toLowerCase())
    );
    
    if (this.showAllBrands || filtered.length <= 5) {
      return filtered;
    }
    
    return filtered.slice(0, 5);
  }

  getStarArray(count: number): number[] {
    return Array(count).fill(0);
  }

  clearFilters(): void {
    this.filterService.clearFilters();
    this.brandSearchTerm = '';
    this.showAllBrands = false;
  }

}
