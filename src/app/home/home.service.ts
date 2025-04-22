import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, lastValueFrom, map, Observable } from 'rxjs';
import { Position } from '../models/position';
import { TokenService } from '../token.service';
import { TradingAccount, User } from '../models/user';
import { environment } from '../../../env.prod';
import { Respon } from '../models/Respon';


@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private options = {}
  private positionSubject = new BehaviorSubject<Position[]>([])
  private tradingAccountsSubject = new BehaviorSubject<TradingAccount[]>([])
  public tradingAccounts = this.tradingAccountsSubject.asObservable()
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
    this.getTradingAccounts()
  }

  getTradingAccounts(): void {
    this.http.get<Respon<TradingAccount>>(environment.apiUrl + '/accounts/all', this.options)
    .subscribe({
      next: accounts => {
        this.tradingAccountsSubject.next(accounts.data)
      },
      error: error => alert(error.message)
    })
  }
  

  getPositions(filter: string | null = null){
    let currentPosition: Position[] = [];
    let tradeAccounts: {id:string, tradingAccountId:string}[] = [];
    this.tradingAccountsSubject.getValue().forEach(accounts => {
      accounts.tradingAccounts.forEach(trade => {
        tradeAccounts.push({
          id: accounts.id,
          tradingAccountId: trade.tradingAccountId
        })
      })
    });
    const positionRequests = tradeAccounts.map(account => {
      return this.http
        .get<Position[]>(`${environment.apiUrl}/trade/opened-position?tradingAccountId=${account.tradingAccountId}&id=${account.id}`, this.options)
        .pipe(
          map(positions => {
            return positions.map(position => ({
              ...position,
              tradingAccountId: account.tradingAccountId,
              idAccount: account.id
            }));
          })
        );
    });

    forkJoin(positionRequests).subscribe(allPositions => {
      currentPosition = allPositions.flat();
      if(filter){
        currentPosition = currentPosition.filter(position => position.symbol === filter)
      }
      this.positionSubject.next(currentPosition);
    });
    
  }

  async editPosition(limitOrder: { slPrice: number, tpPrice: number}){
    const editRequest = this.positionSubject.getValue().map( position => {
      let body = {
        instrument: position.symbol,
        id: position.id,
        orderSide: position.side,
        volume: position.volume,
        slPrice: limitOrder.slPrice,
        tpPrice: limitOrder.tpPrice,
        isMobile: false
      }
      return this.http
       .post<any>(`${environment.apiUrl}/trade/edit?tradingAccountId=${position.tradingAccountId}&id=${position.idAccount}`, body, this.options)
    })
    try {
      await Promise.all(editRequest.map( req => lastValueFrom(req)))
      this.getPositions()
    } catch (error) {
      
    }
  }

  async closePosition(position: Position){
    return this.http
     .post<any>(`${environment.apiUrl}/trade/close?tradingAccountId=${position.tradingAccountId}&id=${position.idAccount}`, {
        positionId: position.id,
        instrument: position.symbol,
        orderSide: position.side == "BUY" ? "SELL" : "BUY",
        volume: position.volume
     }, this.options)
     .subscribe({
       next: () => this.getPositions(),
       error: error => console.error('Error while executing trade', error)
     })
  }

  async flatten(){
    let flatten = this.positionSubject.getValue().map(position => {
      return this.http
      .post<any>(`${environment.apiUrl}/trade/close?tradingAccountId=${position.tradingAccountId}&id=${position.idAccount}`, {
         positionId: position.id,
         instrument: position.symbol,
         orderSide: position.side == "BUY" ? "SELL" : "BUY",
         volume: position.volume
      }, this.options)
    })
    try {
      await Promise.all(flatten.map( req => lastValueFrom(req)))
      this.getPositions()
    } catch (error) {
      
    }
  }
}
