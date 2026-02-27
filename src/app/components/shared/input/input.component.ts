import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() helper = '';
  @Input() disabled = false;
  @Input() required = false;

  value: any = '';
  inputId = `input-${Math.random().toString(36).substring(2, 9)}`;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(value: any): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  get inputClasses(): string {
    const baseClasses = 'w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none transition-all';
    const errorClass = this.error ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500';
    return `${baseClasses} ${errorClass}`;
  }
}