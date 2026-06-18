import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  DestroyRef,
} from '@angular/core';

import { ReplayAnimation } from '../shared/replay-animation.directive';
import { Cell } from './game.store';
import { FAST_SPLIT_MS } from './game.config';

interface Popup {
  text: string;
  leftPct: number;
  topPct: number;
  /** Bumped each time so the element is re-created and the animation replays. */
  nonce: number;
}

/**
 * Presentational grid of colour boxes.
 *
 * Owns only transient *visual feedback* — it already knows which cell is odd
 * (`cell.isOdd`), so it can shake + flash on a wrong pick and float a reward
 * popup on a correct one locally, then delegate the actual game move upward via
 * `boxSelected`. Keeping this self-contained keeps the store free of view state.
 */
@Component({
  selector: 'app-game-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReplayAnimation],
  templateUrl: './game-grid.component.html',
  styleUrl: './game-grid.component.scss',
})
export class GameGrid {
  private readonly destroyRef = inject(DestroyRef);

  readonly cells = input.required<Cell[]>();
  readonly gridSize = input.required<number>();
  /** Used purely as an animation key so the grid replays its reveal each level. */
  readonly level = input.required<number>();

  readonly boxSelected = output<number>();

  protected readonly shaking = signal(false);
  protected readonly flashing = signal(false);
  protected readonly popup = signal<Popup | null>(null);

  private levelRenderedAt = Date.now();
  private shakeTimer?: ReturnType<typeof setTimeout>;
  private flashTimer?: ReturnType<typeof setTimeout>;
  private popupTimer?: ReturnType<typeof setTimeout>;
  private popupNonce = 0;

  constructor() {
    // Reset the per-level split clock whenever a new level renders.
    effect(() => {
      this.level();
      this.levelRenderedAt = Date.now();
    });
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.shakeTimer);
      clearTimeout(this.flashTimer);
      clearTimeout(this.popupTimer);
    });
  }

  protected onSelect(cell: Cell): void {
    if (cell.isOdd) {
      this.showReward(cell.index);
    } else {
      this.showWrong();
    }
    this.boxSelected.emit(cell.index);
  }

  private showReward(index: number): void {
    const n = this.gridSize();
    const split = Date.now() - this.levelRenderedAt;
    this.popup.set({
      text: split <= FAST_SPLIT_MS ? '⚡ Fast!' : 'Nice!',
      leftPct: ((index % n) + 0.5) * (100 / n),
      topPct: (Math.floor(index / n) + 0.5) * (100 / n),
      nonce: ++this.popupNonce,
    });
    clearTimeout(this.popupTimer);
    this.popupTimer = setTimeout(() => this.popup.set(null), 800);
  }

  private showWrong(): void {
    this.shaking.set(true);
    this.flashing.set(true);
    clearTimeout(this.shakeTimer);
    clearTimeout(this.flashTimer);
    this.shakeTimer = setTimeout(() => this.shaking.set(false), 400);
    this.flashTimer = setTimeout(() => this.flashing.set(false), 450);
  }
}
