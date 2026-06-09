import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { authReducer } from './store/auth/auth.reducer';
import { pollReducer } from './store/poll/poll.reducer';
import { voteReducer } from './store/vote/vote.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { PollEffects } from './store/poll/poll.effects';
import { VoteEffects } from './store/vote/vote.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideStore({
      auth: authReducer,
      poll: pollReducer,
      vote: voteReducer
    }),
    provideEffects([
      AuthEffects,
      PollEffects,
      VoteEffects
    ]),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true
    })
  ]
};
