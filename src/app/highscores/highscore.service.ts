import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { Highscore, HighscoreInput } from '../models/highscore.model';

/**
 * HTTP access to the highscores API. RxJS fits here: HTTP responses are
 * single-shot async streams with natural error channels the components subscribe
 * to (or bridge into signals at the edge).
 */
@Injectable({ providedIn: 'root' })
export class HighscoreService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/highscores`;

  /** The fastest `limit` players (sorted by `timeMs` ascending). */
  getTopHighscores(limit = 10): Observable<Highscore[]> {
    return this.http.get<Highscore[]>(this.baseUrl).pipe(
      map((scores) =>
        [...scores].sort((a, b) => a.timeMs - b.timeMs).slice(0, limit),
      ),
    );
  }

  /** Submit a score. A `400` surfaces as an `HttpErrorResponse` with `errors`. */
  submitScore(input: HighscoreInput): Observable<Highscore> {
    return this.http.post<Highscore>(this.baseUrl, input);
  }
}
