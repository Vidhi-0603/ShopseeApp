import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ProductsService } from '../Services/products-service';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: false,
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search {
  searchValue:string ='';
  isLoading: boolean = false;
  placeholder: string = 'Search products...';
  showSuggestion:boolean =true;
  suggestions: string[] = [];
  maxSuggestions: number = 5;
  showSuggestionList: boolean = false;
  clearable: boolean = true;
  searchControl: FormControl = new FormControl('');


  constructor(private productService: ProductsService,
    private router: Router,
    private route: ActivatedRoute
  ){
    this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      const isResultsPage = event.url.includes('/results');

      if (!isResultsPage) {
        this.productService.setSearchTerm('');
        this.searchControl.setValue('');
        localStorage.removeItem('searchTerm');
      }
    }
  });
  }

  ngOnInit(){
    this.isLoading = false;

    //to populate search field on page refresh/reload
    const query = this.productService.getSearchTerm();
    if (query) this.searchControl.setValue(query)

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
        
      )
      .subscribe((value: string) => {
        this.isLoading = false;
        this.productService.setSearchTerm(value.trim());
        this.loadSuggestions(query);

      });

  }

  onSubmit(){
    console.log("Search happens");
    this.searchValue = this.searchControl.value || '';
    this.hideSuggestions();
    this.productService.setSearchTerm(this.searchValue.trim());
    console.log(this.searchValue)
    this.performSearch(this.searchValue);
  }

  performSearch(query:string){
    this.router.navigate(['/results',query]);
  }

  onBlur() {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      this.hideSuggestions();
    }, 200);
  } 

  onFocus(){
    const query = this.searchControl.value || '';
    if(this.showSuggestion && query.trim().length>0){
      this.loadSuggestions(query);
    }
  }

  clearSearch() {
    this.searchControl.setValue('');
    this.searchValue = ''
    this.hideSuggestions();
    this.productService.setSearchTerm('');
    localStorage.removeItem('searchTerm');
  }

  loadSuggestions(query: string){
    this.productService.getSuggestions(query).subscribe(
      suggestions =>{
        this.suggestions = suggestions.slice(0,this.maxSuggestions);
        this.showSuggestionList = suggestions.length > 0;
      }
    )
  }

  hideSuggestions(){
    this.showSuggestionList = false;
  }
  selectSuggestion(suggestion: string) {
    console.log('selected', suggestion);
    this.searchControl.setValue(suggestion);
    this.performSearch(suggestion);
    this.hideSuggestions();
  }

}
