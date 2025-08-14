import { Component, ElementRef } from '@angular/core';
import { Auth } from '../Services/auth';
import { Router } from '@angular/router';
import { Redirect } from '../Services/redirect';
import { GetData } from '../Services/get-data';
import { ProductsService } from '../Services/products-service';

@Component({
  selector: 'app-wishlist',
  standalone: false,
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css'
})
export class Wishlist {

  constructor(private auth : Auth,
    private router: Router,
    private redirect : Redirect,
    private getSetData: GetData,
    private productsService: ProductsService
  ) {}

  wishlistProducts: any[] = [];

  ngOnInit(){

    this.auth.checkSession().subscribe((isLoggedIn) => {
      if (isLoggedIn) { 
        this.productsService.displayWishlist(this.auth.user.value?.Uid || '',this.auth.user.value?.token || '').subscribe();
        this.productsService.wishlist$.subscribe((wishlist) => {
          console.log('Wishlist Data:', wishlist);
          this.wishlistProducts = wishlist; 
        });
      } else {
        this.redirect.setRedirect('/wishlist/', { action: 'getWishlist' });
        this.router.navigate(['/login']);
        return;
      }
    });

  }
  

  goToProducts() {
    alert('Redirecting to products page...');
    this.router.navigate(['/home']);
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
//wishlist component
  removeFromWishlist(productId: number){
    this.productsService.removeFromWishlist(productId, this.auth.user.value?.Uid || '', this.auth.user.value?.token || '').subscribe({
      next: () => {
        console.log('Removed from wishlist');      
      },
      error: err => console.error('Error removing item:', err)
    });
  }

  viewDetails(id: number){
    this.router.navigate(['/details', id]);
  }
  
  addToCart(product: any){
    this.productsService.addToCart(product,this.auth.user.value?.Uid || '', this.auth.user.value?.token || '').subscribe({
      next:(res) =>{console.log('Product added to cart successfully!',res)},
      error: (err)=>{console.log('Error adding product to cart!',err)}
    });
  }

}
