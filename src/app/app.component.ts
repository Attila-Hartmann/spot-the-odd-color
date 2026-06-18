import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeToggle } from './theme/theme-toggle.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ThemeToggle],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {}
