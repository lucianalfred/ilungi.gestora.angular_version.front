// shared/loading-overlay/loading-overlay.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="relative">
      <!-- Overlay de loading -->
      <div *ngIf="isLoading" 
           class="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
        <app-loading-spinner [size]="'lg'" [text]="text"></app-loading-spinner>
      </div>
      
      <!-- Conteúdo (sempre visível, mas pode estar atrás do overlay) -->
      <div [class.opacity-50]="isLoading" [class.pointer-events-none]="isLoading">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      min-height: 200px;
    }
  `]
})
export class LoadingOverlayComponent {
  @Input() isLoading = false;
  @Input() text = 'Carregando...';
}