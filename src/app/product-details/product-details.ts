import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DisplayProducts } from '../Services/display-products';
import { GetData } from '../Services/get-data';
import { Redirect } from '../Services/redirect';
import { ProductsService } from '../Services/products-service';
import { Auth } from '../Services/auth';

@Component({
  selector: 'app-product-details',
  standalone: false,
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})

export class ProductDetails {
  id: number = 0;
  loading: boolean = false;
  currentImageIndex = 0;
  showActions: boolean = true;
  WishlistProductIDs: number[] = [];
  redirectRoute : any | null = null;
  constructor(private displaybyCategory: DisplayProducts, 
    private route: ActivatedRoute,
    private getSetData: GetData,
    private redirectService : Redirect,
    private router: Router,
    private auth: Auth,
    private productsService: ProductsService 
  ) {}
  product: any;

  ngOnInit(){
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading= true;
    this.displaybyCategory.viewProductDetails(this.id).subscribe((data: any) => {
      this.product = data;
      this.loading = false;
    })

    this.productsService.loadWishlist();
    this.productsService.wishlistIds$.subscribe(ids =>{
      this.WishlistProductIDs = ids;
    })

    

  }

  goBackToProductsPage(){
    const redirectPath = this.redirectService.getRedirect();
    console.log("redirect to ",redirectPath);
    if(redirectPath){
      this.router.navigate([redirectPath.route]).then(() => {
        setTimeout(()=>{
          const element = document.getElementById(`product-${redirectPath.productId}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
        },500);
      });
    }
  }

  addToWishlist(product: any) {
    const route = '/details/' +product.id;
    this.getSetData.setDataForWishlist(product,route);
  }

   removeFromWishlist(productId: number){
    this.productsService.removeFromWishlist(productId, this.auth.user.value?.Uid || '').subscribe({
      next: () => {
        console.log('Removed from wishlist');     
    },
      error: err => console.error('Error removing item:', err)
    });
  }

  addToCart(product: any){
    const route = '/details/' +product.id;
    this.getSetData.setDataForCart(product,route);
  }

  getDiscountedPrice(price: number, discount: number): number {
    return price - (price * discount / 100);
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  }

  getStockStatusText(stock: number): string {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  }

  getRatingStars(rating: number): string[] {
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

  nextImage(): void {
    if (this.product && this.product.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.product.images.length;
    }
  }

  prevImage(): void {
    if (this.product && this.product.images.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.product.images.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

}
