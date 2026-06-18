import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'odd-box-personal-best';

/**
 * Persists the player's fastest completion time in `localStorage`.
 * Exposed as a signal so the menu/result can react to a new record.
 */
@Injectable({ providedIn: 'root' })
export class PersonalBestService {
  readonly best = signal<number | null>(this.read());

  /** True when `timeMs` beats the stored best (or there is none yet). */
  isNewRecord(timeMs: number): boolean {
    const current = this.best();
    return current === null || timeMs < current;
  }

  /** Store `timeMs` if it's a new record; returns whether it was saved. */
  save(timeMs: number): boolean {
    if (!this.isNewRecord(timeMs)) {
      return false;
    }
    this.best.set(timeMs);
    try {
      localStorage.setItem(STORAGE_KEY, String(timeMs));
    } catch {
      // Ignore storage failures (private mode, quota) — non-critical.
    }
    return true;
  }

  private read(): number | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    const value = raw === null ? NaN : Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  }
}
