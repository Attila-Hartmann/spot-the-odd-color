import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { DurationPipe } from '../shared/duration.pipe';
import { Highscore } from '../models/highscore.model';
import { HighscoreService } from './highscore.service';

type ViewState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'loaded'; items: Highscore[] };

/** Shows the top-10 fastest players, with loading / empty / error states. */
@Component({
  selector: 'app-highscores-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DurationPipe],
  templateUrl: './highscores-page.component.html',
  styleUrl: './highscores-page.component.scss',
})
export class HighscoresPage {
  private readonly highscores = inject(HighscoreService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly state = signal<ViewState>({ status: 'loading' });
  /** Convenience accessor: avoids relying on template narrowing across @switch. */
  protected readonly items = computed(() => {
    const s = this.state();
    return s.status === 'loaded' ? s.items : [];
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.state.set({ status: 'loading' });
    this.highscores
      .getTopHighscores(10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => this.state.set({ status: 'loaded', items }),
        error: () => this.state.set({ status: 'error' }),
      });
  }
}
