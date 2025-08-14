import { Component, Input } from '@angular/core';
import { DisplayProducts } from '../../Services/display-products';
import { Router } from '@angular/router';
// import { Auth } from '../../Services/auth';
// import { ProductsService } from '../../Services/products-service';
// import { User } from '../../Models/user';
// import { Redirect } from '../../Services/redirect';
import { GetData } from '../../Services/get-data';
import { ProductsService } from '../../Services/products-service';
import { Auth } from '../../Services/auth';
import { Redirect } from '../../Services/redirect';

@Component({
  selector: 'app-electronic',
  standalone: false,
  templateUrl: './electronic.html',
  styleUrl: './electronic.css'
})
export class Electronic {
  @Input() products: any[] = [];

  @Input() isLoading: boolean = false;

  WishlistProductIDs: number[] = [];

  constructor(
    private router : Router, 
    private getSetData: GetData,
    private productsService: ProductsService,
    private auth : Auth,
    private redirectServive: Redirect) { }

  ngOnInit() {
    this.isLoading = false;
    this.productsService.loadWishlist();
    this.productsService.wishlistIds$.subscribe(ids =>{
      this.WishlistProductIDs = ids;
    })
  }

  viewDetails(id: number){
    const route = '/home/';
    this.redirectServive.setRedirect(route,{},id);
    this.router.navigate(['/details', id]);
  }
  
  addToWishlist(product:any){
    const route = '/home/';
    this.getSetData.setDataForWishlist(product,route);
  }

  addToCart(product: any){
    const route = '/home/';
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

