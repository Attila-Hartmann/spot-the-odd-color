import { Routes } from '@angular/router';

import { Menu } from './menu/menu.component';

export const routes: Routes = [
  { path: '', component: Menu, title: 'Odd Box' },
  {
    path: 'game',
    title: 'Play — Odd Box',
    loadComponent: () =>
      import('./game/game-page.component').then((m) => m.GamePage),
  },
  {
    path: 'highscores',
    title: 'Highscores — Odd Box',
    loadComponent: () =>
      import('./highscores/highscores-page.component').then(
        (m) => m.HighscoresPage,
      ),
  },
  // Unknown URLs fall back to the menu.
  { path: '**', redirectTo: '' },
];
