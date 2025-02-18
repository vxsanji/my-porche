import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Market } from './models/market';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../env.prod';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private options = {}
  constructor(
      private http: HttpClient,
      private token: TokenService
    ) {
      this.options = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': this.token.getToken(),
        })
      }
    }

  getMarket(symbol:string): Observable<Market[]> {
    return this.http
    .get<Market[]>(`${environment.apiUrl}/market?symbol=${symbol}`, this.options)
  }
}
