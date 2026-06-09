import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PollService } from '../../core/services/poll.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as PollActions from './poll.actions';
import { catchError, map, mergeMap, tap, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class PollEffects {
  private actions$ = inject(Actions);
  private pollService = inject(PollService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private router = inject(Router);

  loadPolls$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PollActions.loadPolls),
      tap(() => this.spinner.show()),
      mergeMap(action =>
        this.pollService.getPolls(action.page, action.pageSize).pipe(
          map(result => {
            this.spinner.hide();
            return PollActions.loadPollsSuccess({ result });
          }),
          catchError(error => {
            this.spinner.hide();
            const errorMsg = error.error?.message || 'Failed to load polls.';
            this.toastr.error(errorMsg, 'Error');
            return of(PollActions.loadPollsFailure({ error: errorMsg }));
          })
        )
      )
    )
  );

  loadActivePolls$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PollActions.loadActivePolls),
      tap(() => this.spinner.show()),
      mergeMap(() =>
        this.pollService.getActivePolls().pipe(
          map(polls => {
            this.spinner.hide();
            return PollActions.loadActivePollsSuccess({ polls });
          }),
          catchError(error => {
            this.spinner.hide();
            const errorMsg = error.error?.message || 'Failed to load active polls.';
            this.toastr.error(errorMsg, 'Error');
            return of(PollActions.loadActivePollsFailure({ error: errorMsg }));
          })
        )
      )
    )
  );

  createPoll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PollActions.createPoll),
      tap(() => this.spinner.show()),
      mergeMap(action =>
        this.pollService.createPoll(action.poll).pipe(
          map(poll => {
            this.spinner.hide();
            this.toastr.success('Custom poll created successfully!', 'Success');
            this.router.navigate(['/admin/polls']);
            return PollActions.createPollSuccess({ poll });
          }),
          catchError(error => {
            this.spinner.hide();
            const errorMsg = error.error?.message || 'Failed to create poll.';
            this.toastr.error(errorMsg, 'Error');
            return of(PollActions.createPollFailure({ error: errorMsg }));
          })
        )
      )
    )
  );

  createFifaPoll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PollActions.createFifaPoll),
      tap(() => this.spinner.show()),
      mergeMap(() =>
        this.pollService.createFifaPoll().pipe(
          map(poll => {
            this.spinner.hide();
            this.toastr.success('FIFA World Cup Nation Poll created successfully!', 'Success');
            this.router.navigate(['/admin/polls']);
            return PollActions.createFifaPollSuccess({ poll });
          }),
          catchError(error => {
            this.spinner.hide();
            const errorMsg = error.error?.message || 'Failed to create FIFA poll.';
            this.toastr.error(errorMsg, 'Error');
            return of(PollActions.createFifaPollFailure({ error: errorMsg }));
          })
        )
      )
    )
  );

  enablePoll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PollActions.enablePoll),
      tap(() => this.spinner.show()),
      mergeMap(action =>
        this.pollService.enablePoll(action.id).pipe(
          map(() => {
            this.spinner.hide();
            this.toastr.success('Poll enabled successfully!', 'Success');
            return PollActions.enablePollSuccess({ id: action.id });
          }),
          catchError(error => {
            this.spinner.hide();
            const errorMsg = error.error?.message || 'Failed to enable poll.';
            this.toastr.error(errorMsg, 'Error');
            return of(PollActions.enablePollFailure({ error: errorMsg }));
          })
        )
      )
    )
  );

  disablePoll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PollActions.disablePoll),
      tap(() => this.spinner.show()),
      mergeMap(action =>
        this.pollService.disablePoll(action.id).pipe(
          map(() => {
            this.spinner.hide();
            this.toastr.warning('Poll disabled successfully!', 'Disabled');
            return PollActions.disablePollSuccess({ id: action.id });
          }),
          catchError(error => {
            this.spinner.hide();
            const errorMsg = error.error?.message || 'Failed to disable poll.';
            this.toastr.error(errorMsg, 'Error');
            return of(PollActions.disablePollFailure({ error: errorMsg }));
          })
        )
      )
    )
  );

  deletePoll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PollActions.deletePoll),
      tap(() => this.spinner.show()),
      mergeMap(action =>
        this.pollService.deletePoll(action.id).pipe(
          map(() => {
            this.spinner.hide();
            this.toastr.success('Poll deleted successfully!', 'Success');
            return PollActions.deletePollSuccess({ id: action.id });
          }),
          catchError(error => {
            this.spinner.hide();
            const errorMsg = error.error?.message || 'Failed to delete poll.';
            this.toastr.error(errorMsg, 'Error');
            return of(PollActions.deletePollFailure({ error: errorMsg }));
          })
        )
      )
    )
  );
}
