import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  standalone: false,
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories {
  products: any[] = [];
  constructor(private router : Router) { } 

  displayProductsByCategory(category: string) {
    this.router.navigate(['/products', category]);
  }
  
}
