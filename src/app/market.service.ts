import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';
import { Market } from './models/market';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { TradingAccount } from './models/user';
import { environment } from '../../env.prod';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
    private acc!: TradingAccount;
    constructor(
        private http: HttpClient,
        private userService: AuthService
    ) {
        this.userService.currentUser.subscribe( user => {
            this.acc = user!.tradingAccounts[0]
        })
    }

    getMarket(symbol:string): Observable<Market[]> {
        const headers = new HttpHeaders({
              'Content-Type': 'application/json',
        });
        return this.http
        .get<Market[]>(`${environment.apiUrl}/market?tradingApiToken=${this.acc.tradingApiToken}&system_uuid=${this.acc.offer.system.uuid}&symbol=${symbol}`,  { headers, withCredentials:true })
    }


}
