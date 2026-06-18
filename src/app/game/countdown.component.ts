import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ReplayAnimation } from '../shared/replay-animation.directive';

/** Big animated 3-2-1 number shown before level 1. */
@Component({
  selector: 'app-countdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReplayAnimation],
  template: `
    <div class="countdown" role="status" aria-live="assertive">
      <p class="countdown__label">Get ready</p>
      <!-- replay the pop animation on each new number -->
      <span class="countdown__number" [appReplayOn]="value()">{{ value() }}</span>
    </div>
  `,
  styles: `
    .countdown {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
    }
    .countdown__label {
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }
    .countdown__number {
      font-size: clamp(5rem, 22vw, 9rem);
      font-weight: 800;
      line-height: 1;
      color: var(--color-accent);
      animation: ob-pop 0.55s var(--ease-out) both;
    }
  `,
})
export class Countdown {
  readonly value = input.required<number>();
}
