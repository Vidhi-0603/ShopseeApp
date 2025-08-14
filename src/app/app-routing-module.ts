import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { Productbycategory } from './productbycategory/productbycategory';
import { ProductDetails } from './product-details/product-details';
import { Login } from './login/login';
import { Wishlist } from './wishlist/wishlist';
import { Cart } from './cart/cart';
import { SearchResults } from './search-results/search-results';

const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: Home},
  {path: 'products/:category', component: Productbycategory}, 
  {path: 'details/:id', component : ProductDetails},
  {path: 'login', component : Login},
  {path:'wishlist',component: Wishlist},
  {path:'cart',component : Cart},
  {path:'results/:query',component:SearchResults},
  {
    path: 'results/:query/details/:id',
    component: ProductDetails
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
