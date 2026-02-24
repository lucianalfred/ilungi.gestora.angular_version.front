// src/app/components/shared/loading-overlay/loading-overlay.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    @if (!isLoading) {
      <ng-content></ng-content>
    } @else {
      <div class="relative">
        <div class="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-2xl">
          <app-loading-spinner [size]="'md'" [text]="text"></app-loading-spinner>
        </div>
        <div class="opacity-50 pointer-events-none">
          <ng-content></ng-content>
        </div>
      </div>
    }
  `
})
export class LoadingOverlayComponent {
  @Input() isLoading = false;
  @Input() text = '';
}