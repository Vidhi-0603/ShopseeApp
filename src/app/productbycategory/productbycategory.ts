import { Component, Input } from '@angular/core';
import { DisplayProducts } from '../Services/display-products';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../Services/auth';
import { ProductsService } from '../Services/products-service';
import { Redirect } from '../Services/redirect';
import { GetData } from '../Services/get-data';
import { Home } from '../home/home'
import { ProductsFilter} from '../Services/products-filter';


import { Product } from '../Services/products-filter';


@Component({
  selector: 'app-productbycategory',
  standalone: false,
  templateUrl: './productbycategory.html',
  styleUrl: './productbycategory.css'
})
export class Productbycategory {

  constructor(private displaybyCategory: DisplayProducts, 
    private route: ActivatedRoute,
    private router : Router,
    private auth : Auth,
    private productsService: ProductsService,
    private getSetData: GetData,
    private redirectServive: Redirect,
  private filterService: ProductsFilter) {}
  
  showFilter = false;
  category: string = '';
  products: { [category: string]: Product[] } = {};
  isLoading: boolean = false;
  WishlistProductIDs: number[] = [];

  filteredProducts: Product[]= [];

  ngOnInit() {


    this.isLoading = true;
    this.category = this.route.snapshot.paramMap.get('category') || '';

    if(this.category === 'watches') {
      this.displaybyCategory.getProductsByCategory(['womens-watches', 'mens-watches'])
        .subscribe((data) => {
          this.products = data;
          this.isLoading = false;
          this.filterService.loadProducts(this.products)


        });    
    }

    else if(this.category === 'electronics') {
      this.displaybyCategory.getProductsByCategory(['laptops', 'mobile-accessories', 'smartphones', 'tablets'])
        .subscribe((data) => {
          this.products = data;
          this.isLoading = false;
    this.filterService.loadProducts(this.products)

        });    
    }

    else if(this.category === 'shoes') {
      this.displaybyCategory.getProductsByCategory(['womens-shoes','mens-shoes'])
        .subscribe((data) => {
          this.products = data;
          this.isLoading = false;
              this.filterService.loadProducts(this.products)

        });    
    }

    else if(this.category === 'vehicles') {
      this.displaybyCategory.getProductsByCategory(['vehicle','motorcycle'])
        .subscribe((data) => {
          this.products = data;
          this.isLoading = false;
              this.filterService.loadProducts(this.products)


        });    
    }else{
       this.displaybyCategory.getProductsByCategory(this.category).subscribe((data) => {
        this.products = data;
        this.isLoading = false;
          console.log(this.products)

          this.filterService.loadProducts(this.products)


    });
    }

    this.productsService.loadWishlist();
    this.productsService.wishlistIds$.subscribe(ids =>{
      this.WishlistProductIDs = ids;
    })

    // this.filterService.applyfil();

    this.filterService.filteredProducts$.subscribe(filtered => {
      this.filteredProducts = filtered;
    });
    
  }

  // getFilteredCategoryKeys(): string[] {
  //   return Object.keys(this.filteredProducts).filter(cat => this.filteredProducts[cat]?.length > 0);
  // }
  
  productExistsInFilteredProducts(productId: number): boolean {
  return this.filteredProducts.some(product => product.id === productId);
}

// productExistsInFiltered(productId: number): boolean {
//   return this.filteredProducts.some(p => p.id === productId);
// }  

  getCategoryKeys(): string[]{
    return Object.keys(this.products);
  }
  
  viewDetails(id: number){
    const route = '/products/' +this.category;
    this.redirectServive.setRedirect(route,{},id);
    this.router.navigate(['/details', id]);  }

  addToWishlist(product:any){
    const route = '/products/' +this.category;
    this.getSetData.setDataForWishlist(product,route);
  }

  addToCart(product: any){
    const route = '/products/' +this.category;
    this.getSetData.setDataForCart(product,route);
  }

  removeFromWishlist(productId: number){
    this.productsService.removeFromWishlist(productId, this.auth.user.value?.Uid || '', this.auth.user.value?.token || '').subscribe({
      next: () => {
        console.log('Removed from wishlist');     
    },
      error: err => console.error('Error removing item:', err)
    });
  }


  trackByProductId(product: any) {
    return product.id;
  }
  //  retry() {
  //   alert('Retrying to load wishlist...');
  //   location.reload();
  // }

  onImageError(event:any) {
    event.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
  }
  getStarArray(rating: any) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    
    if (hasHalfStar) {
      stars.push('☆');
    }
    
    while (stars.length < 5) {
      stars.push('☆');
    }
    
    return stars;
  }

  updateDisplay() {
    location.reload();
  }

}
