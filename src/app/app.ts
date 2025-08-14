import { Component } from '@angular/core';
import { Auth } from './Services/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected title = 'ShopseeApp';
  constructor(private auth: Auth) {}

  ngOnInit(){
    this.auth.autologin();
  }
  // onsearchResults(results: any){
  //   this.searchResults = results;
  // }

}
