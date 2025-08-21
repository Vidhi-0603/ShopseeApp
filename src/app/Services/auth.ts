import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseAuth } from '../Models/responseAuth';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { User } from '../Models/user';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private api_key: string = environment.firebase.apiKey;
  user = new BehaviorSubject<User | null>(null);
  private tokenExpiretimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private afAuth: AngularFireAuth
  ) {}

  // ---------------- AUTH ---------------- //

  signUp(email: string, password: string) {
    return this.http.post<ResponseAuth>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.api_key}`,
      { email, password, returnSecureToken: true }
    ).pipe(
      catchError(this.handleError),
      tap(res => this.handleCreateUser(res))
    );
  }

  login(email: string, password: string) {
    return this.http.post<ResponseAuth>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.api_key}`,
      { email, password, returnSecureToken: true }
    ).pipe(
      catchError(this.handleError),
      tap(res => this.handleCreateUser(res))
    );
  }

  private handleCreateUser(res: ResponseAuth) {
    const expiresIn = new Date(Date.now() + (+res.expiresIn * 1000));
    const user = new User(res.localId, res.refreshToken, res.idToken, expiresIn);

    this.user.next(user);
    localStorage.setItem('userData', JSON.stringify(user));

    const timerValue = expiresIn.getTime() - Date.now();
    this.autoLogout(timerValue);

    console.log("✅ User created successfully", user);
  }

  // ---------------- AUTO LOGIN / LOGOUT ---------------- //

  autologin() {
    const rawdata = localStorage.getItem('userData');
    if (!rawdata) return;

    const loggedUser = User.fromJson(JSON.parse(rawdata));
    if (!loggedUser.token || !loggedUser.expiresIn || !loggedUser.refreshToken) return;

    this.user.next(loggedUser);

    const timerValue = loggedUser.expiresIn.getTime() - Date.now();
    this.autoLogout(timerValue);

    console.log("✅ User auto-logged in", loggedUser);
  }

  autoLogout(expireTime: number) {
    this.tokenExpiretimer = setTimeout(() => this.logout(), expireTime);
  }

  logout() {
    if (!this.user.value) {
      console.log("ℹ️ No user logged in, cannot logout");
      return;
    }

    this.user.next(null);
    localStorage.removeItem('userData');
    if (this.tokenExpiretimer) clearTimeout(this.tokenExpiretimer);
    this.tokenExpiretimer = null;

    this.router.navigate(['/home']);
    console.log("✅ Logged out successfully");
  }

  // ---------------- SESSION + TOKEN REFRESH ---------------- //

  checkSession(): Observable<boolean> {
    const rawData = localStorage.getItem('userData');
    if (!rawData) return of(false);

    const user = User.fromJson(JSON.parse(rawData));
    if (!user.token || !user.expiresIn) return of(false);

    const now = Date.now();
    if (now > user.expiresIn.getTime()) {
      console.log("⚠️ Token expired, refreshing...");
      return this.refreshtoken();
    }

    console.log("✅ Token is valid");
    return of(true);
  }

  refreshtoken(): Observable<boolean> {
    const rawData = localStorage.getItem('userData');
    if (!rawData) return of(false);

    const oldUser = User.fromJson(JSON.parse(rawData));
    const refreshToken = oldUser.refreshToken;
    if (!refreshToken) return of(false);

    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refreshToken);

    return this.http.post<any>(
      `https://securetoken.googleapis.com/v1/token?key=${this.api_key}`,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ).pipe(
      map(data => {
        if (data.id_token) {
          const expiresIn = new Date(Date.now() + +data.expires_in * 1000);

          const user = new User(
            data.user_id,
            data.refresh_token,
            data.id_token,
            expiresIn
          );

          this.user.next(user);
          localStorage.setItem('userData', JSON.stringify(user));

          const timerValue = expiresIn.getTime() - Date.now();
          this.autoLogout(timerValue);

          console.log("✅ Token refreshed successfully");
          return true;
        }
        console.log("❌ No id_token in refresh response");
        return false;
      }),
      catchError(err => {
        console.error("❌ Token refresh failed:", err);
        return of(false);
      })
    );
  }

  /**
   * 🔑 Helper function:
   * Always gives you a VALID idToken (refreshes if needed).
   */
  getValidToken(): Observable<string | null> {
    const rawData = localStorage.getItem('userData');
    if (!rawData) return of(null);

    const user = User.fromJson(JSON.parse(rawData));
    if (!user.token || !user.expiresIn) return of(null);

    if (Date.now() > user.expiresIn.getTime()) {
      // expired → refresh
      return this.refreshtoken().pipe(
        map(success => success ? this.user.value?.token ?? null : null)
      );
    }

    // valid
    return of(user.token);
  }

  // ---------------- ERROR HANDLER ---------------- //

  private handleError(err: { error: { error: { message: any } } }) {
    let errorMessage = 'An unknown error occurred';
    if (!err.error || !err.error.error) return throwError(() => errorMessage);

    switch (err.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = "This email already exists.";
        break;
      case 'OPERATION_NOT_ALLOWED':
        errorMessage = 'This operation is not allowed.';
        break;
      case 'INVALID_LOGIN_CREDENTIALS':
        errorMessage = 'The email or password is incorrect.';
        break;
    }
    return throwError(() => errorMessage);
  }
}
