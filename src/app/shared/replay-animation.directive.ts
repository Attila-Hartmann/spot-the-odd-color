import { Directive, ElementRef, effect, inject, input } from '@angular/core';

/**
 * Restarts the host element's CSS animation whenever the bound trigger changes.
 *
 * CSS animations don't replay on attribute changes, so we briefly clear the
 * `animation` property and force a reflow — the canonical restart trick. This
 * keeps the level-reveal / countdown-pop / reward-popup animations replaying
 * without recreating DOM nodes (which `@for` keyed tricks do, triggering
 * NG0956).
 */
@Directive({ selector: '[appReplayOn]' })
export class ReplayAnimation {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Change this value to replay the animation. */
  readonly trigger = input.required({ alias: 'appReplayOn' });

  constructor() {
    effect(() => {
      this.trigger(); // establish the dependency
      const node = this.el.nativeElement;
      node.style.animation = 'none';
      void node.offsetWidth; // force reflow so the restart takes effect
      node.style.animation = '';
    });
  }
}
