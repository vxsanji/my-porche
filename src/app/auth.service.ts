import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, distinctUntilChanged, forkJoin, map, NEVER, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { Balance, User } from './models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from './token.service';
import { LoginRes } from './models/loginRes';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });
  private baseUrl = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User|null>(null)
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged())
  public isAuthenticated = this.currentUser.pipe(map( user => !!user))
  constructor(
    private http: HttpClient,
    private token: TokenService
  ) { }
  setAuth(user: User): void {
    this.currentUserSubject.next(user)
    this.token.saveUserToStorage(JSON.stringify(user))
  }
  purgeAuth(): void {
    this.token.destroyUserToStorage();
    this.currentUserSubject.next(null);
  }
  login(account: {email:string, password:string}): Observable<any> {
    const body = {
      email: account.email,
      password: account.password,
      brokerId: "2"
    };
    return this.http
      .post<LoginRes>(this.baseUrl+'/api/login', body, { headers: this.headers , withCredentials:true })
      .pipe(
        switchMap(user => {
          user.tradingAccounts = user.tradingAccounts.filter(account =>
            !account.offer.name.includes("Trial") &&
            account.tradingAccountId !== "859274"
            // account.tradingAccountId !== "909633"
          );
          const balanceRequests = user.tradingAccounts.map(account =>
            this.http.get<Balance>(`${this.baseUrl}/api/balance?tradingApiToken=${account.tradingApiToken}&system_uuid=${account.offer.system.uuid}`, {headers:this.headers, withCredentials:true})
            .pipe(
              map(balance => ({ ...account, balance }))
            )
          );
    
          return forkJoin(balanceRequests).pipe(
            map(updatedAccounts => {
              user.tradingAccounts = updatedAccounts;
              return user;
            })
          );
        }),
        tap(user => this.setAuth(user as User))
      )
  }
  getCurrentUser(): Observable<User> {
    const user = JSON.parse(this.token.getUserFromStorage()) as User;
    const tradingAccount = user.tradingAccounts[0]
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    let body = {
      tradingApiToken: tradingAccount.tradingApiToken,
      system_uuid:  tradingAccount.offer.system.uuid
    }
    return this.http.post<User>(this.baseUrl+'/api/user', body, { headers, withCredentials:true }).pipe(
      tap({
        next: balance => {
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
