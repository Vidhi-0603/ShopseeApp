import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseAuth } from '../Models/responseAuth';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { User } from '../Models/user';
import { Router } from '@angular/router';
import { ProductsService } from './products-service';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private api_key: string = "AIzaSyAak2WKa96P4Q-cIA2tsAW1NlegvTC70c4";
  user = new BehaviorSubject<User | null>(null);
  private tokenExpiretimer: any;

  constructor(private http : HttpClient,private router:Router
  ){}

  signUp(email: string, password: string) {
    
    return this.http.post<ResponseAuth>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.api_key}`,{
      email,
      password,
      returnSecureToken: true
    }).pipe(catchError(this.handleError), tap((res) => {
      this.handleCreateUser(res)
    }));
  }

  login(email: string, password: string) {
    
    return this.http.post<ResponseAuth>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.api_key}`,{
      email,
      password,
      returnSecureToken: true
    }).pipe(catchError(this.handleError), tap((res) => {
      this.handleCreateUser(res);
      })
    );
  }


  handleCreateUser(res: ResponseAuth) {
    const now = new Date().getTime();
    const expiresInTs = now + (+res.expiresIn * 1000);
    const expiresIn = new Date(expiresInTs);

    const user = new User(res.localId, res.refreshToken, res.idToken, expiresIn);
    this.user.next(user);
    localStorage.setItem('userData', JSON.stringify(user));
    console.log("User created successfully", user);

  }

  autologin(){
    const rawdata = localStorage.getItem('userData');
    if(!rawdata){
      return;
    }
    const loggedUser = User.fromJson(JSON.parse(rawdata));
    if(!loggedUser.token || !loggedUser.expiresIn || !loggedUser.refreshToken){
      return;
    }

    if(loggedUser.token){
            this.user.next(loggedUser);
            const timerValue = loggedUser.expiresIn.getTime() - new Date().getTime();
            this.autoLogout(timerValue);
        }
    console.log("User auto-logged in", loggedUser);
  }

  autoLogout(expireTime: number){
        this.tokenExpiretimer = setTimeout(() => {
            this.logout();
        }, expireTime);
  }

  logout(){

    //if no user is logged in, do nothing
    if(!this.user.value){ 
      console.log("No user is logged in, cannot logout");
      return;
    }
    
    this.user.next(null);


    this.router.navigate(['/home']);

    localStorage.removeItem('userData');
    if(this.tokenExpiretimer){
      clearTimeout(this.tokenExpiretimer);
    }
    this.tokenExpiretimer = null;

    console.log("logged out successfully");

  }


  checkSession(): Observable<boolean> {

    const rawData = localStorage.getItem('userData');
    if (!rawData) {
      return of(false);
    }
    const user = User.fromJson(JSON.parse(rawData));
    const idToken = user.token; // Uses getter logic
    const expiresIn = user.expiresIn?.getTime();
    console.log("Checking session", expiresIn, idToken);

    if (!idToken || !expiresIn) {
      console.log("No token or expiresIn found, returning false");
      return of(false);
    }
    const now = Date.now();
    if(now > expiresIn){
      console.log("Token is expired, refreshing...");
      // If the token is expired, we need to refresh it
      return this.refreshtoken();
    }
    console.log("Token is valid, returning true");
    return of(true);
  }


  refreshtoken(): Observable<boolean> {
    const rawData = localStorage.getItem('userData');
    if (!rawData) return of(false);

    const oldUser = User.fromJson(JSON.parse(rawData));
    const refreshToken = oldUser.refreshToken;

    if (!refreshToken) {
      console.log("No refresh token found, returning false");
      return of(false);
    } 

    const params = new HttpParams() 
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken,);

    return this.http.post<any>(`https://securetoken.googleapis.com/v1/token?key=${this.api_key}`, params)
      .pipe(
        map(data => {
        if (data.id_token) {
          const now = Date.now();
          const expiryTime = now + (+data.expires_in * 1000);

          const user = new User(data.user_id, data.refresh_token, data.id_token, new Date(expiryTime));
          this.user.next(user);
          localStorage.setItem('userData', JSON.stringify(user));
          console.log("Token refreshed successfully");
          return true;
        }
        console.log(" no id token Failed to refresh token");
        return false;
      }),
      catchError(() => of(false))
      )
    }
  


  private handleError(err: { error: { error: { message: any; }; }; }){
        let errorMessage = 'An unknown error has occured'
        console.log(err);
        if(!err.error || !err.error.error){
            return throwError(() => errorMessage);
        }
        switch (err.error.error.message){
            case 'EMAIL_EXISTS':
                errorMessage ="This email already exists.";
                break;
            case 'OPERATION_NOT_ALLOWED':
                errorMessage = 'This operation is not allowed.';
                break;
            case 'INVALID_LOGIN_CREDENTIALS':
                errorMessage = 'The email ID or Password is not correct.';
                break
        }
        return throwError(() => errorMessage);
    }
}
