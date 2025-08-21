import { Injectable } from '@angular/core';
import { Auth } from './auth';
import { ProductsService } from './products-service';
import { Redirect } from './redirect';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GetData {

  // private PendingwishlistProduct: any = null;


  constructor(private auth: Auth, 
    private productsService: ProductsService,
    private redirectServive: Redirect,
    private router : Router) {}
    
  setDataForWishlist(product: any,route:string){
    this.auth.checkSession().subscribe((isLoggedIn) => {
      if (isLoggedIn) { 
        this.productsService.addToWishlist(product, this.auth.user.value?.Uid || '').subscribe(
          {
            next: ()=>{
              alert("added to wishlist!!");
            }
          }
        );
      } else {
        this.redirectServive.setRedirect(route, { action: 'addToWishlist', product },product.id);
        this.router.navigate(['/login']);
        return;
      }
    });


  }


  setDataForCart(product: any,route:string){
    this.auth.checkSession().subscribe((isLoggedIn) => {
      if (isLoggedIn) { 
        this.productsService.addToCart(product, this.auth.user.value?.Uid || '').subscribe(
          {
            next: ()=>{console.log("added to cart successfully!!!")}
          }
        );
      } else {
        this.redirectServive.setRedirect(route, { action: 'addToCart', product },product.id);
        this.router.navigate(['/login']);
        return;
      }
    });
  }

}
