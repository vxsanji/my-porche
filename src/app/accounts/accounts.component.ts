import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../env.prod';
import { TokenService } from '../token.service';
import { Account } from '../models/accounts';
import { Respon } from '../models/Respon';
import { Deactivated } from '../models/deactivated';
import { TradingAccount } from '../models/user';
import { TrAccountComponent } from '../home/tr-account/tr-account.component';
import { AccountService } from './accounts.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [ReactiveFormsModule, TrAccountComponent],
  templateUrl: './accounts.component.html',
})
export class AccountsComponent implements OnInit {
  options = {}
  deactivated: Deactivated[] = [];
  accounts: Account[] = []
  tradingAccounts : TradingAccount[] = []
  tradingAccountId =  new FormControl('f', Validators.required)
  account = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    baseUrl: new FormControl('', [Validators.required]),
    brokerId: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  })
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private accountService: AccountService
  ){
    this.options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.tokenService.getToken(),
      })
    }
  }
  ngOnInit(): void {
    this.getAccounts()
    this.getTradingAccounts()
  }

  getTradingAccounts(): void {
    this.accountService.getTradingAccounts()
    .subscribe({
      next: a => this.tradingAccounts = a.data,
      error: (error) => console.error('Error fetching trading accounts:', error)
    })
  }

  addDeactivatedAccount(): void {
    this.http.post(environment.apiUrl + '/accounts/deactivate', {tradingAccountId: this.tradingAccountId.value, note: '...'}, this.options)
   .subscribe({
     next: () => {
       this.tradingAccountId.reset()
       this.getDeactivatedAccounts()
     },
     error: error => alert(error.message)
   })
  }
  removeDeactivate(tradingAccountId: string): void {
    this.http.delete(environment.apiUrl + '/accounts/deactivate?tradingAccountId=' + tradingAccountId, this.options)
   .subscribe({
     next: () => {
       this.getDeactivatedAccounts()
     },
     error: error => alert(error.message)
   })
  }
  getDeactivatedAccounts(): void {
    this.http.get<Respon<Deactivated>>(environment.apiUrl + '/accounts/deactivated', this.options)
    .subscribe({
      next: accounts => this.deactivated = accounts.data,
      error: error => alert(error.message)
    })
  }

  getAccounts(): void {
    this.http.get<Respon<Account>>(environment.apiUrl + '/accounts', this.options)
    .subscribe({
      next: accounts => this.accounts = accounts.data,
      error: error => alert(error.message)
    })
  }

  onSubmit(): void {
    if (this.account.valid) {
      this.http.post<Account>(environment.apiUrl + '/accounts', this.account.value, this.options)
     .subscribe({
        next: account => {
          this.accounts.push(account)
          this.account.reset()
        },
        error: error => alert(error.message)
      })
    } else {
      alert('Form is invalid!')
    }
  }
}
