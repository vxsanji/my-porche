import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TradeService } from './trade.service';
import { Trade } from '../models/trade'
import { HomeService } from '../home/home.service';
import { Position } from '../models/position';
import { MarketService } from '../market.service';
import { TradingAccount } from '../models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../token.service';
import { environment } from '../../../env.prod';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-trade',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './trade.component.html',
})
export class TradeComponent implements OnInit {
  private positions: Position[] = []
  private options = {}
  private tradingAccounts: TradingAccount[] = []
  marketPrice: number = 0;
  trade = new FormGroup({
    instrument: new FormControl('EURUSD.c', [Validators.required]),
    orderSide: new FormControl('', [Validators.required]),
    volume: new FormControl(0.01, [Validators.required]),
    slPrice: new FormControl(0, [Validators.required]),
    tpPrice: new FormControl(0, [Validators.required]),
    isMobile: new FormControl(false, [Validators.required]),
  })

  constructor(
    private http: HttpClient,
    private tradeService: TradeService,
    private homeService: HomeService,
    private tokenService: TokenService
  ){
    this.options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.tokenService.getToken(),
      })
    }
    // this.getMarket('EURUSD.c')
    // this.trade.get("instrument")?.valueChanges.subscribe( instrument => {
    //   if(instrument) this.getMarket(instrument)
    // })
    // this.homeService.positions.subscribe( p => {
    //   this.positions = p;
    // })
  }
  ngOnInit(): void {
    this.homeService.tradingAccounts
    .subscribe({
      next: (accounts) => {
        this.tradingAccounts = accounts   
      },
      error: (error) => console.error('Error getting trading accounts:', error)
    })
  }
  // getMarket(instrument: string){
  //   this.marketService.getMarket(instrument).subscribe({
  //     error: (error) => console.error('Error getting market price:', error)
  //   })
  // }

  buy(){
    let payload = this.trade.value as Trade;
    payload.orderSide = 'BUY';
    this.excuteTrade(payload)
  }
  sell(){
    let payload = this.trade.value as Trade;
    payload.orderSide = 'SELL';
    this.excuteTrade(payload)
  }

  private async excuteTrade(trade: Trade){
    const tradeAccounts: {id:string, tradingAccountId:string}[] = []
    this.tradingAccounts.forEach(acc => {
      acc.tradingAccounts.forEach(trade => {
        tradeAccounts.push({
          id: acc.id,
          tradingAccountId: trade.tradingAccountId
        })
      })
    })

    const tradeRequest = tradeAccounts.map( acc => {
      return this.http.post(
        `${environment.apiUrl}/trade/open?tradingAccountId=${acc.tradingAccountId}&id=${acc.id}`, trade, this.options)
    })
    try {
      await Promise.all(tradeRequest.map( req => lastValueFrom(req)));
      this.homeService.getPositions();
    } catch (error) {
      console.error('Error while executing trade', error);
    }
  }

  flatten(){
    this.homeService.flatten()
  }
}
