import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TradeService } from './trade.service';
import { Trade } from '../models/trade'
import { HomeService } from '../home/home.service';
import { MarketService } from '../market.service';
import { TradingAccount } from '../models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../token.service';
import { environment } from '../../../env.prod';
import { lastValueFrom } from 'rxjs';
import { Market } from '../models/market';


@Component({
  selector: 'app-trade',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './trade.component.html',
})
export class TradeComponent implements OnInit {
  options = {}
  market: Market[] = [];
  tradingAccounts: TradingAccount[] = [];
  slPoint: number = 100
  tpPoint: number = 200
  profit: number = 150
  loss: number = 75
  trade = new FormGroup({
    instrument: new FormControl('EURUSD.c', [Validators.required]),
    orderSide: new FormControl('', [Validators.required]),
    volume: new FormControl(0.01, [Validators.required]),
    slPrice: new FormControl(0, [Validators.required]),
    tpPrice: new FormControl(0, [Validators.required]),
    isMobile: new FormControl(false, [Validators.required]),
  })
  selectedPair: {
    name: string,
    symbol: string,
    step: string
  } = {
    name: '',
    symbol: '',
    step: ''
  }

  pairList: {
    name: string,
    symbol: string,
    step: string
  }[] = [
    {
      name: 'EURUSD',
      symbol: 'EURUSD.c',
      step: "0.00001"
    },
    {
      name: 'GBPUSD',
      symbol: 'GBPUSD.c',
      step: "0.00001"
    },
    {
      name: 'USDJPY',
      symbol: 'USDJPY.c',
      step: "0.001"
    },
    {
      name: 'AUDUSD',
      symbol: 'AUDUSD.c',
      step: "0.00001"
    },
    {
      name: 'NZDUSD',
      symbol: 'NZDUSD.c',
      step: "0.00001"
    },
    {
      name: 'USDCAD',
      symbol: 'USDCAD.c',
      step: "0.00001"
    },
    {
      name: 'USDCHF',
      symbol: 'USDCHF.c',
      step: "0.00001"
    },
    {
      name: 'EURJPY',
      symbol: 'EURJPY.c',
      step: "0.001"
    },
    {
      name: 'GBPJPY',
      symbol: 'GBPJPY.c',
      step: "0.001"
    },
    {
      name: 'AUDJPY',
      symbol: 'AUDJPY.c',
      step: "0.001"
    },
    {
      name: 'US100',
      symbol: 'NSDQ.c',
      step: "1"
    },
    {
      name: 'US500',
      symbol: 'SP.c',
      step: "1"
    },
    {
      name: 'XAUUSD',
      symbol: 'XAUUSD.c',
      step: "0.01"
    },
    {
      name: 'XAGUSD',
      symbol: 'XAGUSD.c',
      step: "0.01"
    },
    {
      name: 'BTCUSD',
      symbol: 'BTCUSD.c',
      step: "0.00001"
    },
  ]

  constructor(
    private http: HttpClient,
    private homeService: HomeService,
    private marketService: MarketService,
    private tokenService: TokenService
  ){
    this.options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.tokenService.getToken(),
      })
    }
    this.selectedPair = this.pairList[0]
  }
  ngOnInit(): void {
    this.homeService.tradingAccounts.subscribe({
      next: (accounts) => {
        this.tradingAccounts = accounts
      },
      error: (error) => console.error('Error fetching trading accounts:', error)
    })
    this.trade.get("instrument")?.valueChanges.subscribe( instrument => {
      if(instrument) this.marketService.getMarket(instrument).subscribe({
        next: (market) => {
          this.market = market
        },
        error: (error) => console.error('Error getting market price:', error)
      })
    })
    this.trade.get("orderSide")?.valueChanges.subscribe( side => {
      let instrument = this.trade.get('instrument')?.value! 
      this.marketService.getMarket(instrument).subscribe({
        next: (market) => {
          this.market = market
          this.initiateTrade(side)
        },
        error: (error) => console.error('Error getting market price:', error)
      })
    })
    this.trade.get('volume')?.valueChanges.subscribe(volume => {
      if(volume){
        this.loss = Math.round(volume * this.slPoint)
        this.profit = Math.round(volume * this.tpPoint)
      }
    })
    this.trade.get('slPrice')?.valueChanges.subscribe( slPrice => {
      let side = this.trade.get('orderSide')?.value
      let volume = this.trade.get('volume')?.value!
      if(slPrice && side && volume){
        if(side == 'BUY') {
          let slP = Number(this.market[0].ask) - slPrice
          this.slPoint = Math.round(slP * 100000)
          this.loss = Math.round(volume * slP * 100000)
        }else{
          let slP = slPrice - Number(this.market[0].ask)
          this.slPoint = Math.round(slP * 100000)
          this.loss = Math.round(volume * slP * 100000)
        }
      }
    })
    this.trade.get('tpPrice')?.valueChanges.subscribe(tpPrice => {
      let side = this.trade.get('orderSide')?.value
      let volume = this.trade.get('volume')?.value!
      if(tpPrice && side && volume){
        if(side == 'BUY') {
          let slP = tpPrice - Number(this.market[0].ask)
          this.tpPoint = Math.round(slP * 100000)
          this.profit = Math.round(volume * slP * 100000)
        }else{
          let slP = Number(this.market[0].ask) - tpPrice
          this.tpPoint = Math.round(slP * 100000)
          this.profit = Math.round(volume * slP * 100000)
        }
      }
    })
  }

  onPairChange(event: Event){
    const selectedPair = (event.target as HTMLSelectElement).value;
    this.selectedPair = this.pairList.find(pair => pair.symbol === selectedPair) || this.pairList[0];
    let instrument = this.trade.get('instrument')?.value! 
    this.marketService.getMarket(instrument).subscribe({
      next: (market) => {
        this.market = market
        this.initiateTrade(this.trade.get('orderSide')!.value)
      },
      error: (error) => console.error('Error getting market price:', error)
    })
  }

  initiateTrade(orderSide: string|null){
    if(orderSide !== null){
      let vol = (this.loss / this.slPoint).toFixed(2)
      if(orderSide === "BUY"){
        let slP = (Number(this.market[0].ask) - this.slPoint*0.00001).toFixed(6)
        let tpP = (Number(this.market[0].ask) + this.tpPoint*0.00001).toFixed(6)
        this.trade.patchValue({
          slPrice: Number(slP),
          tpPrice: Number(tpP),
          volume: Number(vol)
        })
      }else{
        let slP = (Number(this.market[0].ask) + this.slPoint*0.00001).toFixed(6)
        let tpP = (Number(this.market[0].ask) - this.tpPoint*0.00001).toFixed(6)
        this.trade.patchValue({
          slPrice: Number(slP),
          tpPrice: Number(tpP),
          volume: Number(vol)
        })
      }
    }
  }

  refreshPrice() {
    const instrument = this.trade.get('instrument')?.value
    if(instrument) this.marketService.getMarket(instrument).subscribe({
      next: (market) => {
        this.market = market
        this.initiateTrade(this.trade.get('orderSide')!.value)
      },
      error: (error) => console.error('Error getting market price:', error)
    })
  }

  async excuteTrade(){
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
        `${environment.apiUrl}/trade/open?tradingAccountId=${acc.tradingAccountId}&id=${acc.id}`, this.trade.value, this.options)
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
