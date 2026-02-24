import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ICONS } from './icons.config';
import { Import } from 'lucide-angular';
import { AppPageComponent } from './components/pages/app-page/app-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ilungi.gestora.angular_version.front';
}
