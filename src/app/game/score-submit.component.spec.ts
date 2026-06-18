import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../environments/environment';
import { ScoreSubmit } from './score-submit.component';

describe('ScoreSubmit (integration)', () => {
  let httpMock: HttpTestingController;
  const url = `${environment.apiBaseUrl}/highscores`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ScoreSubmit],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function setup(timeMs = 42000): ComponentFixture<ScoreSubmit> {
    const fixture = TestBed.createComponent(ScoreSubmit);
    fixture.componentRef.setInput('timeMs', timeMs);
    fixture.detectChanges();
    return fixture;
  }

  function typeName(fixture: ComponentFixture<ScoreSubmit>, name: string): void {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = name;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function submit(fixture: ComponentFixture<ScoreSubmit>): void {
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('posts {name, timeMs} and shows success on 201', () => {
    const fixture = setup(42000);
    typeName(fixture, 'Ada');
    submit(fixture);

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Ada', timeMs: 42000 });

    req.flush({
      id: 'x',
      name: 'Ada',
      timeMs: 42000,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Score saved');
  });

  it('maps a 400 errors body to a field message and keeps the form usable', () => {
    const fixture = setup(42000);
    typeName(fixture, 'Ada');
    submit(fixture);

    httpMock.expectOne(url).flush(
      {
        error: 'Invalid highscore',
        errors: { name: 'name is required and must be a non-empty string' },
      },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('name is required');
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    );
    expect(btn.disabled).toBe(false);
  });

  it('does not hit the API when the name is blank (client-side validation)', () => {
    const fixture = setup();
    submit(fixture);
    httpMock.expectNone(url);
  });
});
