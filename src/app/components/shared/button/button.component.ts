import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' = 'primary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() className = '';
  @Output() onClick = new EventEmitter<void>();

  get buttonClasses(): string {
    const baseClasses = 'px-8 py-4 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-3 disabled:opacity-50';
    
    const variants = {
      primary: 'bg-[#10b981] hover:bg-[#059669] text-white shadow-xl shadow-emerald-500/20',
      secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
      outline: 'bg-transparent border-2 border-[#10b981] text-[#10b981] hover:bg-emerald-50',
      danger: 'bg-rose-500 hover:bg-rose-600 text-white',
      ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
    };

    return `${baseClasses} ${variants[this.variant]} ${this.className}`;
  }

  handleClick(): void {
    if (!this.disabled) {
      this.onClick.emit();
    }
  }
}