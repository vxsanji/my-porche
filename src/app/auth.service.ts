import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, distinctUntilChanged, map, NEVER, Observable, of, shareReplay, tap } from 'rxjs';
import { User } from './models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from './token.service';
import { environment } from '../../env.prod';
import { userLoginRes } from './models/userLogin';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });
  private currentUserSubject = new BehaviorSubject<User|null>(null)
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged())
  public isAuthenticated = this.currentUser.pipe(map( user => !!user))
  private token: string;
  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    this.token = this.tokenService.getToken()
  }
  setAuth(user: User): void {
    this.currentUserSubject.next(user)
    this.tokenService.saveUserToStorage(JSON.stringify(user))
  }
  purgeAuth(): void {
    this.tokenService.destroyUserToStorage();
    this.currentUserSubject.next(null);
  }
  login(account: {username:string, password:string}): Observable<any> {
    const body = {
      username: account.username,
      password: account.password,
    };
    return this.http
      .post<userLoginRes>(environment.apiUrl+'/auth/login', body, { headers: this.headers })
      .pipe(
        tap(user => this.setAuth(user as User))
      )
  }
  loginAllAccounts(): void{
    this.http.get(environment.apiUrl+'/login', {headers:{'Authorization': this.token}})
    .subscribe({
      next: accounts => {
        console.log(accounts)
      },
      error: console.error,
    })
  }
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(environment.apiUrl+'/auth/refresh-token', {headers:{'Authorization': this.token}}).pipe(
      tap({
        next: user => {
          this.setAuth(user)
        },
        error: _ => {
          this.purgeAuth()
        }
      }),
      catchError(error => {
        if (!!error.status && error.status === 401) {
          window.location.href = '/login';
          return NEVER;
        }
        return of(error);
      }),
      shareReplay(1),
    );
  }
}
