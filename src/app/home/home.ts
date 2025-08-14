import { Component, EventEmitter, Output } from '@angular/core';
// import { Subscription } from 'rxjs';
import { User } from '../Models/user';
import { Auth } from '../Services/auth';
import { ProductsService } from '../Services/products-service';
import { DisplayProducts } from '../Services/display-products';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  userData: User | null = null;
  // wishlistProductIds: number[] = [];
  categorizedProducts: { category: string, products: any[] }[] = [];
  isLoading: boolean = false;

  // allProducts: any;
  // private sub!: Subscription;

  constructor(private auth: Auth,
    private getWishlistProductIDs : ProductsService,
    private productService : DisplayProducts
  ) {}

  ngOnInit() {
    
    this.auth.user.subscribe(user => {
      this.userData = user;
      console.log("User data updated in HomeComponent", this.userData);
    });

    // const uid = this.auth.user.value?.Uid || '';
    // const token = this.auth.user.value?.token || '';


  // this.getWishlistProductIDs.displayWishlist(uid, token).subscribe((wishlist) => {
  //   this.wishlistProductIds = wishlist.map((item: any) => item.id);
  // });

  this.isLoading=true;

  this.productService.getProducts().subscribe({
    next: (products) => {
      console.log("Fetched products:", products);
      const grouped = this.groupByCategory(products);
      
      console.log("Grouped products:", grouped); 
      this.categorizedProducts = Object.keys(grouped).map(category => ({
        category,
        products: grouped[category]
      }));
      console.log(this.categorizedProducts);
      this.isLoading=false;
    }
  });

  // this.updateWishlist();
}

// updateWishlist() {
//   const wishlistIds = this.wishlistProductIds; // example
//   this.getWishlistProductIDs.updateWishlist(wishlistIds);
// }


groupByCategory(products: any[]): { [key: string]: any[] } {
    return products.reduce((acc, product) => {
      let category = product.category;

      // ✅ Merge specific categories into one
      if (['mens-watches', 'womens-watches'].includes(category)) {
        category = 'watches';
      } else if (['mens-shoes', 'womens-shoes'].includes(category)) {
        category = 'shoes';
      } else if (['vehicle', 'motorcycle'].includes(category)) {
        category = 'vehicles';
      } else if (['smartphones', 'tablets', 'laptops'].includes(category)) {
        category = 'electronics';
      }

      acc[category] = acc[category] || [];
      acc[category].push(product);
      return acc;
    }, {} as { [key: string]: any[] });
  }

}
