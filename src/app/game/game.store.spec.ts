import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { COUNTDOWN_INTERVAL_MS } from './game.config';
import { GameStore } from './game.store';

/** Time to advance through the full 3-2-1 countdown into play. */
const COUNTDOWN_MS = COUNTDOWN_INTERVAL_MS * 3;

/**
 * Integration test for the game's core loop. The countdown and clock are RxJS
 * `interval`s, so we drive them with Vitest fake timers (this app is zoneless —
 * `fakeAsync`/`tick` are unavailable without zone.js).
 */
describe('GameStore', () => {
  let store: GameStore;

  const pickOdd = () =>
    store.selectBox(store.cells().find((c) => c.isOdd)!.index);

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [GameStore] });
    store = TestBed.inject(GameStore);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs the 3-2-1 countdown, then starts level 1 on a 6×6 grid', () => {
    store.begin();
    expect(store.status()).toBe('countdown');
    expect(store.countdown()).toBe(3);

    vi.advanceTimersByTime(COUNTDOWN_INTERVAL_MS);
    expect(store.countdown()).toBe(2);

    vi.advanceTimersByTime(COUNTDOWN_INTERVAL_MS * 2); // through 1 → play
    expect(store.status()).toBe('playing');
    expect(store.level()).toBe(1);
    expect(store.gridSize()).toBe(6);
    expect(store.cells()).toHaveLength(36);
    expect(store.brightnessDelta()).toBe(30);
  });

  it('advances to the next level (and grows the grid) on a correct pick', () => {
    store.begin();
    vi.advanceTimersByTime(COUNTDOWN_MS);

    pickOdd();

    expect(store.level()).toBe(2);
    expect(store.gridSize()).toBe(7);
    expect(store.cells()).toHaveLength(49);
    expect(store.brightnessDelta()).toBe(25);
  });

  it('ignores a wrong pick', () => {
    store.begin();
    vi.advanceTimersByTime(COUNTDOWN_MS);

    const wrong = store.cells().find((c) => !c.isOdd)!;
    store.selectBox(wrong.index);

    expect(store.level()).toBe(1);
    expect(store.status()).toBe('playing');
  });

  it('finishes after clearing level 5 with a positive elapsed time', () => {
    store.begin();
    vi.advanceTimersByTime(COUNTDOWN_MS);
    vi.advanceTimersByTime(5000); // let the clock run

    for (let level = 1; level <= 5; level++) {
      expect(store.status()).toBe('playing');
      pickOdd();
    }

    expect(store.status()).toBe('finished');
    expect(store.elapsedMs()).toBeGreaterThan(0);
  });
});
