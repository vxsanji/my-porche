import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HistoricalData } from '../models/HistoricalData';
import { Respon } from '../models/Respon';
import { environment } from '../../../env.prod';
import { TokenService } from '../token.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoricalService {
  private options = {}

  constructor(
    private http: HttpClient,
    private token: TokenService
  ) {
    this.options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken(),
      })
    }
  }

  getHistoricalData(
    symbol: string,
    interval: string,
    start: string,
    end: string
  ): Observable<Respon<HistoricalData>> {
    return this.http
    .get<Respon<HistoricalData>>(`${environment.apiUrl}/historical?symbol=${symbol}&interval=${interval}&start=${start}&end=${end}`, this.options)
  }
}
