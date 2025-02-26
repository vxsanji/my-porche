import { Component, ElementRef, ViewChild } from '@angular/core';
import { CandlestickSeries, createChart, IChartApi } from 'lightweight-charts';
import { HistoricalData } from '../../models/HistoricalData';
import { HistoricalService } from '../historical.service';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css'
})
export class ChartComponent {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  private chart!: IChartApi;
  historicalData: HistoricalData[] = []

  constructor(private historicalService: HistoricalService) {}
  
  ngAfterViewInit(): void {
    console.log(this.historicalData)
    this.chart = createChart(this.chartContainer.nativeElement, {
      width: this.chartContainer.nativeElement.clientWidth,
      height: 500,
      layout: {
        background: { color: '#222' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: '#333' },
        horzLines: { color: '#333' },
    },
    });
    const candlestickSeries = this.chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
      wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });
    this.historicalService.getHistoricalData('EUR/USD', '1d', '2019-12-01T00:00:00Z', '2020-12-31T23:59:59Z')
      .subscribe({
        next: (response) => {
          candlestickSeries.setData(response.data);
          this.chart.timeScale().fitContent();
        },
        error: err => console.log('Error fetching data:', err)
      });
  }
}
