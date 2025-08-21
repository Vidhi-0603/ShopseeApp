import { Component } from '@angular/core';
// import { NgForm } from '@angular/forms';
import { Auth } from '../Services/auth';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Redirect } from '../Services/redirect';
import { ProductsService } from '../Services/products-service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  isSignedUp: boolean = true;

  email: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(private auth: Auth,
    private router : Router,
    private redirectService: Redirect,
    private productsService: ProductsService) {}

  onSubmit(form :NgForm) {
    
    if(this.isSignedUp){
      //handle sign In/Login
      this.login(form);
    }else{
      //handle signUp Logic
      this.signUp(form);
    }
  }

  toggle() {
    this.isSignedUp = !this.isSignedUp;
  }

  signUp(form: NgForm) {
    this.auth.signUp(this.email, this.password).subscribe(
      {
        next : (res) => {console.log('Sign Up Successful', res)},
        error : (err) => {
          this.errorMessage = err;
          this.hideSnackbar();
        }
      });
      form.reset();
  }

  login(form: NgForm) {
    this.auth.login(this.email, this.password).subscribe({
      next : (res) => {
        if(res){
          const redirect = this.redirectService.getRedirect();
          if(redirect){
            this.productsService.loadWishlist();
            this.router.navigate([redirect.route]).then(() =>{

              setTimeout(() => {
              const element = document.getElementById(`product-${redirect.productId}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }

              if (redirect.params?.action === 'addToWishlist') {
                this.productsService.addToWishlist(redirect.params.product,this.auth.user.value?.Uid || '').subscribe(
                {
                  next: (response) => {
                    console.log('Product added to wishlist successfully:', response);
                  },
                  error: (error) => {
                    console.error('Error adding product to wishlist:', error);
                  }
                });
              }

              if (redirect.params?.action === 'getWishlist') {
                this.productsService.displayWishlist(this.auth.user.value?.Uid || '').subscribe(
                {
                  next: (response) => {
                    console.log('Wishlist Data:', response);
                  },
                  error: (error) => {
                    console.error('Error displaying wishlist:', error);
                  }
                });
              }

              if (redirect.params?.action === 'getCart') {
                this.productsService.displayCart(this.auth.user.value?.Uid || '').subscribe(
                {
                  next: (response) => {
                    console.log('Cart Data:', response);
                  },
                  error: (error) => {
                    console.error('Error displaying Cart:', error);
                  }
                });
              }

              if (redirect.params?.action === 'addToCart') {
                this.productsService.addToCart(redirect.params.product,this.auth.user.value?.Uid || '').subscribe(
                {
                  next: (response) => {
                    console.log('Product added to cart successfully:', response);
                  },
                  error: (error) => {
                    console.error('Error adding product to cart:', error);
                  }
                });
              }

                this.redirectService.clear();
              }, 500);
            });   
          }else{
            this.router.navigate(['/home']);
          }
        }
      },
      error : (err) => {
          this.errorMessage = err;
          this.hideSnackbar();
        }
    });
    form.reset();
  }

  hideSnackbar(){
    setTimeout(() => {
      this.errorMessage = null;
    }, 3000);
  }
}
