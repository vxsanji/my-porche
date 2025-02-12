import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TradeService } from './trade.service';
import { Trade } from '../models/trade'
import { HomeService } from '../home/home.service';
import { Position } from '../models/position';
import { MarketService } from '../market.service';

@Component({
  selector: 'app-trade',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './trade.component.html',
})
export class TradeComponent {
  private positions: Position[] = []
  trade = new FormGroup({
    instrument: new FormControl('EURUSD.c', [Validators.required]),
    orderSide: new FormControl('', [Validators.required]),
    volume: new FormControl(0.01, [Validators.required]),
    slPrice: new FormControl(0, [Validators.required]),
    tpPrice: new FormControl(0, [Validators.required]),
    isMobile: new FormControl(false, [Validators.required]),
  })

  constructor(
    private tradeService: TradeService,
    private homeService: HomeService,
    private marketService: MarketService
  ){
    this.getMarket('EURUSD.c')
    this.trade.get("instrument")?.valueChanges.subscribe( instrument => {
      if(instrument) this.getMarket(instrument)
    })
    this.homeService.positions.subscribe( p => {
      this.positions = p;
    })
  }
  getMarket(instrument: string){
    this.marketService.getMarket(instrument).subscribe({
      error: (error) => console.error('Error getting market price:', error)
    })
  }

  buy(){
    this.tradeService.buy(this.trade.value as Trade);
  }
  sell(){
    this.tradeService.sell(this.trade.value as Trade);
  }

  flatten(){
    this.tradeService.flatten(this.positions)
  }
}
