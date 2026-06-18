import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { HighscoreService } from '../highscores/highscore.service';
import { HighscoreErrors } from '../models/highscore.model';

const MAX_NAME_LENGTH = 20;

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

/** Rejects whitespace-only names (mirrors the server's `trim()` check). */
function nonBlank(control: AbstractControl): ValidationErrors | null {
  return control.value?.trim().length ? null : { required: true };
}

/**
 * Score submission form. Validates client-side to match the server, maps the
 * `400 {errors}` shape back onto fields, and surfaces loading/success/error
 * states.
 */
@Component({
  selector: 'app-score-submit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './score-submit.component.html',
  styleUrl: './score-submit.component.scss',
})
export class ScoreSubmit {
  private readonly fb = inject(FormBuilder);
  private readonly highscores = inject(HighscoreService);
  private readonly destroyRef = inject(DestroyRef);

  readonly timeMs = input.required<number>();

  protected readonly maxNameLength = MAX_NAME_LENGTH;
  protected readonly status = signal<SubmitStatus>('idle');
  protected readonly serverError = signal<string | null>(null);
  /** Field-level errors returned by the server (e.g. from a 400). */
  protected readonly fieldErrors = signal<HighscoreErrors>({});

  protected readonly submitting = computed(() => this.status() === 'submitting');

  protected readonly form = this.fb.nonNullable.group({
    name: [
      '',
      [Validators.required, Validators.maxLength(MAX_NAME_LENGTH), nonBlank],
    ],
  });

  protected get name() {
    return this.form.controls.name;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.status.set('submitting');
    this.serverError.set(null);
    this.fieldErrors.set({});

    this.highscores
      .submitScore({ name: this.name.value.trim(), timeMs: this.timeMs() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.status.set('success'),
        error: (err: HttpErrorResponse) => this.handleError(err),
      });
  }

  private handleError(err: HttpErrorResponse): void {
    this.status.set('error');
    const errors = err.error?.errors as HighscoreErrors | undefined;
    if (err.status === 400 && errors) {
      this.fieldErrors.set(errors);
      if (errors.name) {
        this.name.setErrors({ server: errors.name });
      }
      // timeMs is derived, not user-editable — surface any such error generally.
      this.serverError.set(errors.timeMs ?? null);
    } else {
      this.serverError.set(
        'Could not submit your score. Check the API is running and try again.',
      );
    }
  }
}
