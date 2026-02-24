import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.css']
})
export class StatCardComponent {
  @Input() icon: any;
  @Input() label = '';
  @Input() value: number = 0;
  @Input() color: 'emerald' | 'rose' = 'emerald';

  bgColors = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/10',
    rose: 'bg-rose-50 dark:bg-rose-900/10'
  };
}