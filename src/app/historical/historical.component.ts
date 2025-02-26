import { Component } from '@angular/core';
import { ChartComponent } from './chart/chart.component';

@Component({
  selector: 'app-historical',
  standalone: true,
  imports: [ChartComponent],
  templateUrl: './historical.component.html',
})
export class HistoricalComponent {

}
