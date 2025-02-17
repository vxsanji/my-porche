import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Position } from '../models/position';
import { TokenService } from '../token.service';
import { TradingAccount, User } from '../models/user';
import { environment } from '../../../env.prod';
import { Respon } from '../models/Respon';


@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private options = {}
  private positionSubject = new BehaviorSubject<Position[]>([])
  public positions = this.positionSubject.asObservable()
  constructor(
    private http: HttpClient,
    private account: TokenService
  ) {
    this.options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.account.getToken(),
      })
    }
  }

  getTradingAccounts(): Observable<Respon<TradingAccount>> {
    return this.http.get<Respon<TradingAccount>>(environment.apiUrl + '/accounts/all-unfiltered', this.options)
  }
  
}
