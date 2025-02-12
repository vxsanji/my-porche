import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
export class TradeService {
  private apiUrl: string = `${environment.apiUrl}'/trade/open`;
  private tradingAccounts: TradingAccount[] = []
  constructor(
    private http: HttpClient,
    private account: TokenService,
    private positionService: HomeService
  ) {
    let user = JSON.parse(this.account.getUserFromStorage()) as User;
    this.tradingAccounts = user.tradingAccounts
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
    let initialVol = trade.volume
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const tradeRequest = this.tradingAccounts.map( acc => {
      let vol = parseInt(acc.balance.balance) / 10000;  
      if(vol < 0.9) vol = 0.5
      else vol = Math.round(vol)
      const newTrade = { ...trade, volume: parseFloat((initialVol * vol).toFixed(2)) };
      return this.http.post(
        `${this.apiUrl}?tradingApiToken=${acc.tradingApiToken}&system_uuid=${acc.offer.system.uuid}`,
        newTrade,
        { headers, withCredentials:true }
      )
    })
    try {
      await Promise.all(tradeRequest.map( req => lastValueFrom(req)));
      this.positionService.setOpenedPosition();
    } catch (error) {
      console.error('Error while executing trade', error);
    }
  }

  flatten(positions: Position[]){
    let x = positions.map( (p:Position) => {
      let orderSide = p.side == 'BUY' ? 'BUY' : 'SELL'
      return {
        positionId: p.id,
        instrument: p.symbol,
        orderSide: orderSide,
        volume: p.volume,
      }
    })
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    let body = {
      tradingApiToken: this.tradingAccounts[0].tradingApiToken,
      system_uuid:  this.tradingAccounts[0].offer.system.uuid,
      positions:x
    }
    return this.http
      .post<any>(environment.apiUrl+'/trade/close-position', body, { headers, withCredentials:true })
  }
}
