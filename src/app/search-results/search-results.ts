import { Component } from '@angular/core';
import { ProductsService, SearchResponse } from '../Services/products-service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Redirect } from '../Services/redirect';

@Component({
  selector: 'app-search-results',
  standalone: false,
  templateUrl: './search-results.html',
  styleUrl: './search-results.css'
})
export class SearchResults {
  isLoading:boolean = false;
  query:string='';
  products: any[] = [];
  results: SearchResponse | null = null;
  constructor(private productService: ProductsService,
        private router: Router,
        private route: ActivatedRoute,
        private redirectServive: Redirect

  ){}


  ngOnInit(){
    // this.isLoading = true;
    this.query = this.productService.getSearchTerm();

    this.productService.searchTerm$
    .pipe(
      debounceTime(0), // already debounced in SearchComponent
      distinctUntilChanged(),
      switchMap(term =>
        term
          ? this.productService.searchProducts(term,0)
          : this.productService.getDefaultProducts()
      )
    )
    .subscribe(res => {
      this.isLoading = false;
      this.products = res.products;
      this.results = res;
      this.query = this.productService.getSearchTerm();
      console.log("new query:",this.query)
    });

  }

  viewDetails(productId: number) {
    const route = '/results/' +this.query;
    this.redirectServive.setRedirect(route,{},productId);
    this.router.navigate(['results', this.query, 'details', productId]);
}
}
