import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as AuthActions from './auth.actions';
import { catchError, map, mergeMap, tap, of } from 'rxjs';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      tap(() => this.spinner.show()),
      mergeMap(action =>
        this.authService.login({ username: action.username, password: action.password }).pipe(
          map(response => AuthActions.loginSuccess({ response })),
          catchError(error => {
            const errorMsg = error.error?.message || 'Login failed. Please check your credentials.';
            return of(AuthActions.loginFailure({ error: errorMsg }));
          })
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(action => {
        this.spinner.hide();
        this.toastr.success(`Welcome back, ${action.response.user.username}!`, 'Login Successful');
        if (action.response.user.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/user/polls']);
        }
      })
    ),
    { dispatch: false }
  );

  loginFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginFailure),
      tap(action => {
        this.spinner.hide();
        this.toastr.error(action.error, 'Login Failed');
      })
    ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      tap(() => this.spinner.show()),
      mergeMap(action =>
        this.authService.register(action.user).pipe(
          map(() => AuthActions.registerSuccess()),
          catchError(error => {
            const errorMsg = error.error?.message || 'Registration failed.';
            return of(AuthActions.registerFailure({ error: errorMsg }));
          })
        )
      )
    )
  );

  registerSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(() => {
        this.spinner.hide();
        this.toastr.success('Registration successful! Please log in.', 'Success');
        this.router.navigate(['/auth/login']);
      })
    ),
    { dispatch: false }
  );

  registerFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerFailure),
      tap(action => {
        this.spinner.hide();
        this.toastr.error(action.error, 'Registration Failed');
      })
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.authService.logout();
        this.toastr.info('You have logged out.', 'Goodbye');
        this.router.navigate(['/auth/login']);
      })
    ),
    { dispatch: false }
  );
}
