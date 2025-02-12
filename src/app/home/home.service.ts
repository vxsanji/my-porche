import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, lastValueFrom, map, Observable } from 'rxjs';
import { Position } from '../models/position';
import { TokenService } from '../token.service';
import { TradingAccount, User } from '../models/user';


@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private baseUrl = 'http://localhost:3000';
  private positionSubject = new BehaviorSubject<Position[]>([])
  public positions = this.positionSubject.asObservable()
  private tradingAccounts: TradingAccount[] = []
  constructor(
    private http: HttpClient,
    private account: TokenService
  ) {
    this.getAccounts()
    this.setOpenedPosition()
  }
  
  getAccounts(){
    let user = JSON.parse(this.account.getUserFromStorage()) as User;
    this.tradingAccounts = user.tradingAccounts
  }

  closePosition(position: Position){
    let orderSide = position.side == 'BUY' ? 'SELL' : 'BUY';
      let body = {
          positionId: position.id,
          instrument: position.symbol,
          orderSide: orderSide,
          volume: position.volume,
        }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .post<any>(
        this.baseUrl+`/api/trade/close-position?tradingApiToken=${position.tradingApiToken}&system_uuid=${position.system_uuid}`,
        body,
        { headers, withCredentials:true }
      )
  }

  setOpenedPosition(){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    let currentPosition: Position[] = [];
    const positionRequests = this.tradingAccounts.map(account => {
      let body = {
        tradingApiToken: account.tradingApiToken,
        system_uuid: account.offer.system.uuid
      };

      return this.http
        .post<Position[]>(this.baseUrl + '/api/trade/opened-position', body, { headers, withCredentials: true })
        .pipe(
          map(positions => {
            return positions.map(position => ({
              ...position,
              tradingApiToken: account.tradingApiToken,
              system_uuid: account.offer.system.uuid
            }));
          })
        );
    });

    forkJoin(positionRequests).subscribe(allPositions => {
      currentPosition = allPositions.flat();
      this.positionSubject.next(currentPosition);
    });
    
  }

  async editPosition(limitOrder: { slPrice: number, tpPrice: number}){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
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
       .post<any>(`${this.baseUrl}/api/trade/edit?tradingApiToken=${position.tradingApiToken}&system_uuid=${position.system_uuid}`, body, { headers, withCredentials:true })
    })
    try {
      await Promise.all(editRequest.map( req => lastValueFrom(req)))
      this.setOpenedPosition()
    } catch (error) {
      
    }
  }
}
