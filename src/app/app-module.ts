import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Navbar } from './navbar/navbar';
import { Home } from './home/home';
import { Categories } from './home/categories/categories';
import { Electronic } from './home/electronic/electronic';
import { HttpClientModule } from '@angular/common/http';
import { Productbycategory } from './productbycategory/productbycategory';
import { ProductDetails } from './product-details/product-details';
import { Login } from './login/login';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Snackbar } from './login/snackbar/snackbar';
import { Wishlist } from './wishlist/wishlist';
import { Cart } from './cart/cart';
import { Search } from './search/search';
import { SearchResults } from './search-results/search-results';
import { CommonModule } from '@angular/common';
import { FilterProducts } from './filter-products/filter-products';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from './environments/environment';

@NgModule({
  declarations: [
    App,
    Navbar,
    Home,
    Categories,
    Electronic,
    Productbycategory,
    ProductDetails,
    Login,
    Snackbar,
    Wishlist,
    Cart,
    Search,
    SearchResults,
    FilterProducts
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
