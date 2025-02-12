import { AfterViewInit, Component, OnInit } from '@angular/core';
import { TradeComponent } from '../trade/trade.component';
import { Position } from '../models/position';
import { HomeService } from './home.service';
import { AuthService } from '../auth.service';
import { TradingAccount } from '../models/user';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TradeComponent, ReactiveFormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  positions : Position[] = []
  accounts : TradingAccount[] = []
  limitOrder = new FormGroup({
      slPrice: new FormControl(0, [Validators.required]),
      tpPrice: new FormControl(0, [Validators.required]),
    })
  constructor(
    private homeService: HomeService,
    private accountsService: AuthService
  ) {}

  ngOnInit(): void {
    this.homeService.positions.subscribe({
      next: p => {
       this.positions = p;
       if(p.length > 0) this.limitOrder.patchValue({
         slPrice: p[0].stopLoss,
         tpPrice: p[0].takeProfit
       })
     }})
    this.accountsService.currentUser.subscribe(a => {
      this.accounts = a!.tradingAccounts;
    })
  }

  close(position: Position){
    this.homeService.closePosition(position)
   .subscribe({
    next: () => this.refresh(),
    error: (error) => console.error('Error closing position:', error)
   })
  }

  refresh(){
    this.homeService.setOpenedPosition();
  }

  stopLossUSD(openPrice: number, stopLoss: number, volume: number): string{
    if(stopLoss == 0) return '-'
    let usd = (openPrice - stopLoss) * volume * 100000
    if(usd < 0 ) usd = usd * -1
    if(openPrice < stopLoss) return usd.toFixed(2)
    return '-'+usd.toFixed(2)
  }
  takeProfitUSD(openPrice: number, takeProfit: number, volume: number): string{
    if(takeProfit == 0) return '-'
    let usd = (openPrice - takeProfit) * volume * 100000
    if(usd < 0 ) usd = usd * -1
    return usd.toFixed(2)
  }

  refresh_balance(){
    this.accountsService.login({
      email: 'akagami.ef@gmail.com',
      password: '#SlQYbG3' // replace with your actual password
    }).subscribe();
  }

  editPosition(){
    this.homeService.editPosition(this.limitOrder.value as  { slPrice: number, tpPrice: number});
  }
}
