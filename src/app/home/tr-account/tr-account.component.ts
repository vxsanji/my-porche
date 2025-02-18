import { Component, Input, OnInit } from '@angular/core';
import { Balance, TradingAccount } from '../../models/user';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../env.prod';
import { TokenService } from '../../token.service';

@Component({
  selector: 'tr[account]',
  standalone: true,
  imports: [],
  templateUrl: './tr-account.component.html',
  styleUrl: './tr-account.component.css'
})
export class TrAccountComponent implements OnInit {
  @Input() acc!: TradingAccount;
  @Input() p!: { tradingAccountId: string, name: string, isActive: boolean };
  options = {}
  balance: Balance
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {
    this.options = {headers:{'Authorization': this.tokenService.getToken()}}
    this.balance = {balance: '', equity: '', freeMargin: '', marginLevel: '', credit: '', currency: '', margin: '', profit: '', netProfit: '', currencyPrecision: 0, title:'', volume:0}
  }
  ngOnInit(): void {
    this.getBalance()
  }
  getBalance(): void {
    const balanceReq = this.http.get<Balance>(`${environment.apiUrl}/balance?tradingAccountId=${this.p.tradingAccountId}&id=${this.acc.id}`, this.options);
    balanceReq.subscribe({
      next: bal => this.balance = bal,
    });
  }

  setToggle(currentStatus:boolean): void {
    if(currentStatus){
      this.http.get(environment.apiUrl + '/accounts/deactivate?tradingAccountId='+this.p.tradingAccountId+'&id='+this.acc.id, this.options)
      .subscribe({
        next: () => {
          this.p.isActive = !currentStatus 
        },
        error: error => alert(error.message)
      })
    }else{
      this.http.delete(environment.apiUrl + '/accounts/deactivate?tradingAccountId='+this.p.tradingAccountId+'&id='+this.acc.id, this.options)
      .subscribe({
        next: () => {
          this.p.isActive = !currentStatus 
        },
        error: error => alert(error.message)
      })
    }
  }

  block(tradingAccountId: string): void {
    this.http.post(environment.apiUrl + '/accounts/block', {tradingAccountId: tradingAccountId}, this.options)
   .subscribe({
     next: () => {
     },
     error: error => alert(error.message)
   })
  }
}
