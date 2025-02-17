import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { forkJoin, lastValueFrom, Observable } from 'rxjs';
import { Trade } from '../models/trade';
import { Position } from '../models/position';
import { TokenService } from '../token.service';
import { TradingAccount, User } from '../models/user';
import { HomeService } from '../home/home.service';
import { environment } from '../../../env.prod';

@Injectable({
  providedIn: 'root'
})
export class TradeService implements OnInit {
  private options = {}
  private apiUrl: string = `${environment.apiUrl}'/trade/open`;
  private tradingAccounts: TradingAccount[] = []
  constructor(
    private http: HttpClient,
    private account: TokenService,
    private homeService: HomeService
  ) {
    this.options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.account.getToken(),
      })
    }
  }
  ngOnInit(): void {
  }
  
  buy(trade: Trade){
    trade.orderSide = 'BUY';
    this.excuteTrade(trade)
  }
  sell(trade: Trade){
    trade.orderSide = 'SELL';
    this.excuteTrade(trade)
  }

  private async excuteTrade(trade: Trade){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const tradeAccounts: {id:string, tradingAccountId:string}[] = []
    console.log(this.tradingAccounts)
    this.tradingAccounts.forEach(acc => {
      acc.tradingAccounts.forEach(trade => {
        console.log(trade)
        tradeAccounts.push({
          id: acc.id,
          tradingAccountId: trade.tradingAccountId
        })
      })
    })

    console.log(tradeAccounts)

    // const tradeRequest = this.tradingAccounts.map( acc => {
    //   return this.http.post(
    //     `${this.apiUrl}?tradingAccountId=${acc.tra}&system_uuid=${acc.offer.system.uuid}`,
    //     newTrade)
    // })
    // try {
    //   await Promise.all(tradeRequest.map( req => lastValueFrom(req)));
    //   this.positionService.setOpenedPosition();
    // } catch (error) {
    //   console.error('Error while executing trade', error);
    // }
  }

  flatten(positions: Position[]){
    // let x = positions.map( (p:Position) => {
    //   let orderSide = p.side == 'BUY' ? 'BUY' : 'SELL'
    //   return {
    //     positionId: p.id,
    //     instrument: p.symbol,
    //     orderSide: orderSide,
    //     volume: p.volume,
    //   }
    // })
    // const headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    // });
    // let body = {
    //   tradingApiToken: this.tradingAccounts[0].tradingApiToken,
    //   system_uuid:  this.tradingAccounts[0].offer.system.uuid,
    //   positions:x
    // }
    // return this.http
    //   .post<any>(environment.apiUrl+'/trade/close-position', body, { headers, withCredentials:true })
  }
}
