import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../Services/auth';
import { Redirect } from '../Services/redirect';
import { ProductsService } from '../Services/products-service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  constructor(private router : Router,
    private auth : Auth,
    private redirect: Redirect,
    private productsService: ProductsService){}
  gotoHome(){
    this.router.navigate(['/home']);
  }
  gotoLogin(){
    this.auth.checkSession().subscribe((isLoggedIn) => {
      if (isLoggedIn) { 
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  logout(){
    this.productsService.clearWishlist();
    this.auth.logout();
    // this.productsServive.loadWishlist();
  }

  ShowWishList(){
    this.auth.checkSession().subscribe((isLoggedIn) => {
      if (isLoggedIn) { 
        this.router.navigate(['/wishlist']);
      } else {
        this.redirect.setRedirect('/wishlist/', { action: 'getWishlist' });
        this.router.navigate(['/login']);
      }
    });
  }

  ShowCart(){
    this.auth.checkSession().subscribe((isLoggedIn) => {
      if (isLoggedIn) { 
        this.router.navigate(['/cart']);
      } else {
        this.redirect.setRedirect('/cart/', { action: 'getCart' });
        this.router.navigate(['/login']);
      }
    });
  }
}
