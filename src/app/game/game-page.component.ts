import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { DurationPipe } from '../shared/duration.pipe';
import { fireConfetti, prefersReducedMotion } from '../shared/celebrate';
import { Countdown } from './countdown.component';
import { GameGrid } from './game-grid.component';
import { GameHud } from './game-hud.component';
import { GameStore } from './game.store';
import { PersonalBestService } from './personal-best.service';
import { ScoreSubmit } from './score-submit.component';

/**
 * Orchestrates a game session. Provides its own `GameStore` so each visit to
 * `/game` is a fresh, self-contained session that's torn down on leave.
 */
@Component({
  selector: 'app-game-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GameStore],
  imports: [Countdown, GameHud, GameGrid, ScoreSubmit, RouterLink, DurationPipe],
  templateUrl: './game-page.component.html',
  styleUrl: './game-page.component.scss',
})
export class GamePage {
  protected readonly store = inject(GameStore);
  private readonly personalBest = inject(PersonalBestService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly best = this.personalBest.best;
  protected readonly newRecord = signal(false);
  protected readonly celebrating = signal(false);

  private celebrated = false;
  private flashTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.store.begin();

    // Run the win celebration once, when the game reaches `finished`.
    effect(() => {
      const finished = this.store.status() === 'finished';
      if (finished && !this.celebrated) {
        this.celebrated = true;
        this.onFinish();
      } else if (!finished) {
        this.celebrated = false;
      }
    });

    this.destroyRef.onDestroy(() => clearTimeout(this.flashTimer));
  }

  protected playAgain(): void {
    this.newRecord.set(false);
    this.store.playAgain();
  }

  private onFinish(): void {
    const time = this.store.elapsedMs();
    this.newRecord.set(this.personalBest.isNewRecord(time));
    this.personalBest.save(time);

    void fireConfetti();
    if (!prefersReducedMotion()) {
      this.celebrating.set(true);
      this.flashTimer = setTimeout(() => this.celebrating.set(false), 900);
    }
  }
}
