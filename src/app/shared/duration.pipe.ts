import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a millisecond duration as `mm:ss`.
 *
 * The assignment asks for a custom pipe and the count-up timer is the natural
 * fit. Pure (the default) so it only recomputes when the input changes.
 *
 * Examples: `0 → "00:00"`, `65000 → "01:05"`, `600000 → "10:00"`.
 * Negative/invalid input clamps to `"00:00"`.
 */
@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(ms: number | null | undefined): string {
    const safeMs = Number.isFinite(ms) && (ms as number) > 0 ? (ms as number) : 0;
    const totalSeconds = Math.floor(safeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${pad(minutes)}:${pad(seconds)}`;
  }
}

const pad = (value: number): string => value.toString().padStart(2, '0');
