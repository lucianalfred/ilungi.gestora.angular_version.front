import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-sidebar-nav-item',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './sidebar-nav-item.component.html',
  styleUrls: ['./sidebar-nav-item.component.css']
})
export class SidebarNavItemComponent {
  @Input() icon: string = ''; // ✅ Agora é string
  @Input() label: string = '';
  @Input() active: boolean = false;
  @Input() collapsed: boolean = false;

  get itemClasses(): string {
    const baseClasses = 'w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all group relative';
    const activeClass = this.active 
      ? 'bg-[#10b981] text-white shadow-xl shadow-emerald-500/20' 
      : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white';
    return `${baseClasses} ${activeClass}`;
  }

  get iconClasses(): string {
    return this.active ? 'scale-110' : 'group-hover:scale-110';
  }
}