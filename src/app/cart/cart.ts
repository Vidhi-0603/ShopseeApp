import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../Services/auth';
import { GetData } from '../Services/get-data';
import { ProductsService } from '../Services/products-service';
import { Redirect } from '../Services/redirect';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {

  constructor(private auth : Auth,
    private router: Router,
    private redirect : Redirect,
    private getSetData: GetData,
    private productsService: ProductsService
  ) {}

  cartProducts: any[] = [];
  
  ngOnInit(){

    this.auth.checkSession().subscribe((isLoggedIn) => {
      if (isLoggedIn) { 
        this.productsService.displayCart(this.auth.user.value?.Uid || '', this.auth.user.value?.token || '').subscribe();
        this.productsService.cart$.subscribe((cart) => {
          console.log('cart Data:', cart);
          this.cartProducts = cart; 

          this.cartProducts.forEach(item => {
            console.log("items: ",item);
            this.updateItemTotalPrice(item);
          });
        });
      } else {
        this.redirect.setRedirect('/cart/', { action: 'getCart' });
        this.router.navigate(['/login']);
        return;
      }
    });

    
  }


  removeFromCart(productId: number) {
  const uid = this.auth.user.value?.Uid || '';
  const idToken = this.auth.user.value?.token || '';

  this.productsService.removeFromCart(productId, uid, idToken).subscribe(
    {
      next: () => {
        console.log('Removed from cart');

        // Immediately refresh cart in UI after successful removal
        this.productsService.displayCart(uid, idToken).subscribe();
      },
      error: (err) => {
        console.error('Error removing item:', err);
      }
    });
  }


  trackByProductId(index: number, item: any): number {
    return item.id;
  }

  getStars(rating: number): { class: string }[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      stars.push({
        class: i < fullStars ? 'star-filled' : 'star-empty'
      });
    }
    
    return stars;
  }

  getDiscountedPrice(item: any): number {
    return item.price * (1 - item.discountPercentage / 100);
  }

  updateItemTotalPrice(item: any): void {
    const discountedPrice = this.getDiscountedPrice(item);
    item.totalPrice = discountedPrice * item.quantity;
  }

  increaseQuantity(item: any): void {
    if (item.quantity < item.stock) {
      item.quantity++;
      this.updateItemTotalPrice(item);
    }
  }

  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.updateItemTotalPrice(item);
    }
  }

  updateQuantity(item: any): void {
    if (item.quantity < 1) {
      item.quantity = 1;
    } else if (item.quantity > item.stock) {
      item.quantity = item.stock;
    }
    this.updateItemTotalPrice(item);
  }

  

  getTotalItems(): number {
    return this.cartProducts.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.cartProducts.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotalDiscount(): number {
    return this.cartProducts.reduce((total, item) => {
      const originalPrice = item.price * item.quantity;
      return total + (originalPrice - item.totalPrice);
    }, 0);
  }

  getShippingCost(): number {
    const subtotal = this.getSubtotal() - this.getTotalDiscount();
    return subtotal > 100 ? 0 : 9.99;
  }

  getTax(): number {
    const subtotal = this.getSubtotal() - this.getTotalDiscount();
    return subtotal * 0.08;
  }

  getTotal(): number {
    const subtotal = this.getSubtotal() - this.getTotalDiscount();
    return subtotal + this.getShippingCost() + this.getTax();
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/120x120?text=No+Image';
  }

  checkout(): void {
    if (this.cartProducts.length === 0) return;
    
    // Implement checkout logic here
    console.log('Proceeding to checkout with items:', this.cartProducts);
    alert('Proceeding to checkout...');
  }

  continueShopping(): void {
    // Implement navigation to products page
    this.router.navigate(['/home']);
    // console.log('Continue shopping clicked');
    alert('Redirecting to home page...');
  }
}
