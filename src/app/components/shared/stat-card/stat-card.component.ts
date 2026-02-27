import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.css'],
})
export class StatCardComponent {
  @Input() icon: string = 'activity';
  @Input() label: string = '';
  @Input() value: number | string = 0;
  @Input() color: 'emerald' | 'rose' | 'blue' | 'amber' = 'emerald';
}