import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DurationPipe } from '../shared/duration.pipe';

/**
 * The bar above the grid: count-up timer (via the custom `duration` pipe), the
 * level indicator, and a small difficulty meter (grid size + brightness delta).
 */
@Component({
  selector: 'app-game-hud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DurationPipe],
  template: `
    <header class="hud">
      <div class="hud__block">
        <span class="hud__label">Time</span>
        <span class="hud__time" aria-live="off">{{ elapsedMs() | duration }}</span>
      </div>

      <div class="hud__block hud__block--center">
        <span class="hud__label">Level</span>
        <span class="hud__level">{{ level() }} / {{ totalLevels() }}</span>
        <span class="hud__pips" aria-hidden="true">
          @for (l of levels(); track l) {
            <span class="hud__pip" [class.hud__pip--on]="l <= level()"></span>
          }
        </span>
      </div>

      <!-- Difficulty meter: a transparency cue for what each level changes. -->
      <div class="hud__block hud__block--end" title="This level's difficulty">
        <span class="hud__label">Difficulty</span>
        <span class="hud__diff">
          <span class="hud__diff-item">{{ gridSize() }}&times;{{ gridSize() }}</span>
          <span class="hud__diff-sep">·</span>
          <span class="hud__diff-item">+{{ delta() }}%</span>
        </span>
      </div>
    </header>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .hud {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      width: 100%;
      padding: var(--space-3) var(--space-4);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-1);
    }
    .hud__block {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }
    .hud__block--center {
      align-items: center;
    }
    .hud__block--end {
      align-items: flex-end;
    }
    .hud__label {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }
    .hud__time {
      font-family: var(--font-mono);
      font-size: 1.6rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    .hud__level {
      font-size: 1.1rem;
      font-weight: 700;
    }
    .hud__pips {
      display: flex;
      gap: 4px;
      margin-top: 2px;
    }
    .hud__pip {
      width: 16px;
      height: 4px;
      border-radius: var(--radius-full);
      background: var(--color-border);
      transition: background var(--motion-base);
    }
    .hud__pip--on {
      background: var(--color-accent);
    }
    .hud__diff {
      font-weight: 600;
      white-space: nowrap;
    }
    .hud__diff-sep {
      margin: 0 4px;
      color: var(--color-text-muted);
    }

    @media (max-width: 30rem) {
      .hud__time {
        font-size: 1.3rem;
      }
      .hud__diff {
        font-size: 0.85rem;
      }
    }
  `,
})
export class GameHud {
  readonly elapsedMs = input.required<number>();
  readonly level = input.required<number>();
  readonly totalLevels = input.required<number>();
  readonly gridSize = input.required<number>();
  readonly delta = input.required<number>();

  protected levels(): number[] {
    return Array.from({ length: this.totalLevels() }, (_, i) => i + 1);
  }
}
