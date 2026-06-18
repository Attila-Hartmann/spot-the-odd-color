import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, interval } from 'rxjs';

import { generateBoxColor, brighten } from '../utils/box-color.utils';
import {
  COUNTDOWN_FROM,
  COUNTDOWN_INTERVAL_MS,
  TOTAL_LEVELS,
  brightnessDeltaForLevel,
  gridSizeForLevel,
} from './game.config';

export type GameStatus = 'countdown' | 'playing' | 'finished';

/** A single grid box. `isOdd` marks the brighter target the player must find. */
export interface Cell {
  index: number;
  color: string;
  isOdd: boolean;
}

/**
 * Single source of truth for a game session.
 *
 * State lives in signals (synchronous UI state the template reads directly);
 * the count-up clock and the 3-2-1 countdown are RxJS `interval` streams bridged
 * into signals — that's the deliberate boundary: signals for state, RxJS for
 * lifecycle-bound streams. Both are torn down via `takeUntilDestroyed` and on
 * `finish`, so a fresh instance is provided per `/game` visit with no leaks.
 */
@Injectable()
export class GameStore {
  private readonly destroyRef = inject(DestroyRef);

  // ---- Writable state (private) -------------------------------------------
  private readonly _status = signal<GameStatus>('countdown');
  private readonly _level = signal(1);
  private readonly _countdown = signal(COUNTDOWN_FROM);
  private readonly _baseColor = signal('');
  private readonly _oddColor = signal('');
  private readonly _oddIndex = signal(0);
  private readonly _elapsedMs = signal(0);

  private startedAt = 0;
  private clockSub?: Subscription;
  private countdownSub?: Subscription;

  // ---- Readonly views (public API) ----------------------------------------
  readonly status = this._status.asReadonly();
  readonly level = this._level.asReadonly();
  readonly countdown = this._countdown.asReadonly();
  readonly elapsedMs = this._elapsedMs.asReadonly();
  readonly totalLevels = TOTAL_LEVELS;

  readonly gridSize = computed(() => gridSizeForLevel(this._level()));
  readonly brightnessDelta = computed(() =>
    brightnessDeltaForLevel(this._level()),
  );
  readonly progress = computed(() => this._level() / TOTAL_LEVELS);

  /** The boxes to render: every box is `baseColor`, the odd one is `oddColor`. */
  readonly cells = computed<Cell[]>(() => {
    const count = this.gridSize() ** 2;
    const base = this._baseColor();
    const odd = this._oddColor();
    const oddIndex = this._oddIndex();
    return Array.from({ length: count }, (_, index) => ({
      index,
      color: index === oddIndex ? odd : base,
      isOdd: index === oddIndex,
    }));
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.stopStreams());
  }

  // ---- Intent methods ------------------------------------------------------

  /** Start (or restart) a session: run the 3-2-1 countdown, then play. */
  begin(): void {
    this.reset();
    this._status.set('countdown');
    this._countdown.set(COUNTDOWN_FROM);
    this.countdownSub = interval(COUNTDOWN_INTERVAL_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const next = this._countdown() - 1;
        if (next <= 0) {
          this.countdownSub?.unsubscribe();
          this.play();
        } else {
          this._countdown.set(next);
        }
      });
  }

  /**
   * Handle a box click. Picking the odd box advances the level (or finishes the
   * game after level 5); any other box is a deliberate no-op.
   */
  selectBox(index: number): void {
    if (this._status() !== 'playing' || index !== this._oddIndex()) {
      return;
    }
    if (this._level() < TOTAL_LEVELS) {
      this._level.update((l) => l + 1);
      this.generateLevel();
    } else {
      this.finish();
    }
  }

  /** Restart from the countdown after finishing. */
  playAgain(): void {
    this.begin();
  }

  // ---- Internals -----------------------------------------------------------

  private play(): void {
    this._level.set(1);
    this.generateLevel();
    this.startedAt = Date.now();
    this._elapsedMs.set(0);
    this._status.set('playing');
    // Tick a few times a second so the displayed mm:ss stays accurate; the final
    // score is recomputed exactly on finish, independent of tick granularity.
    this.clockSub = interval(250)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this._elapsedMs.set(Date.now() - this.startedAt));
  }

  private generateLevel(): void {
    const base = generateBoxColor();
    this._baseColor.set(base);
    this._oddColor.set(brighten(base, this.brightnessDelta()));
    this._oddIndex.set(Math.floor(Math.random() * this.gridSize() ** 2));
  }

  private finish(): void {
    this._elapsedMs.set(Date.now() - this.startedAt);
    this.stopStreams();
    this._status.set('finished');
  }

  private reset(): void {
    this.stopStreams();
    this._level.set(1);
    this._elapsedMs.set(0);
  }

  private stopStreams(): void {
    this.clockSub?.unsubscribe();
    this.countdownSub?.unsubscribe();
    this.clockSub = undefined;
    this.countdownSub = undefined;
  }
}
