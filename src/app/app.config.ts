import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // `withFetch()` uses the Fetch API instead of XHR — recommended for new apps
    // and required for the zoneless setup this project ships with.
    provideHttpClient(withFetch()),
  ],
};
