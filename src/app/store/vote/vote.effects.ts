import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { VoteService } from '../../core/services/vote.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as VoteActions from './vote.actions';
import { catchError, map, mergeMap, tap, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class VoteEffects {
  private actions$ = inject(Actions);
  private voteService = inject(VoteService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private router = inject(Router);

  castVote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VoteActions.castVote),
      tap(() => this.spinner.show()),
      mergeMap(action =>
        this.voteService.castVote(action.pollId, action.optionId).pipe(
          mergeMap(() => {
            this.spinner.hide();
            this.toastr.success('Your vote has been cast!', 'Success');
            // Refresh results and the user's vote status for this poll
            return [
              VoteActions.castVoteSuccess({ pollId: action.pollId, optionId: action.optionId }),
              VoteActions.loadResults({ pollId: action.pollId }),
              VoteActions.loadMyVotes()
            ];
          }),
          catchError(error => {
            this.spinner.hide();
            const errorMsg = error.error?.message || 'Failed to cast vote.';
            this.toastr.error(errorMsg, 'Voting Error');
            return of(VoteActions.castVoteFailure({ error: errorMsg }));
          })
        )
      )
    )
  );

  loadResults$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VoteActions.loadResults),
      tap(() => this.spinner.show()),
      mergeMap(action =>
        this.voteService.getResults(action.pollId).pipe(
          map(results => {
            this.spinner.hide();
            return VoteActions.loadResultsSuccess({ results });
          }),
          catchError(error => {
            this.spinner.hide();
            const errorMsg = error.error?.message || 'Failed to load results.';
            return of(VoteActions.loadResultsFailure({ error: errorMsg }));
          })
        )
      )
    )
  );

  loadMyVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VoteActions.loadMyVotes),
      mergeMap(() =>
        this.voteService.getMyVotes().pipe(
          map(votes => VoteActions.loadMyVotesSuccess({ votes })),
          catchError(error => {
            const errorMsg = error.error?.message || 'Failed to load your vote history.';
            return of(VoteActions.loadMyVotesFailure({ error: errorMsg }));
          })
        )
      )
    )
  );

  loadMyVoteOnPoll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VoteActions.loadMyVoteOnPoll),
      mergeMap(action =>
        this.voteService.getMyVoteOnPoll(action.pollId).pipe(
          map(vote => VoteActions.loadMyVoteOnPollSuccess({ vote })),
          catchError(error => of(VoteActions.loadMyVoteOnPollFailure({ error: error.message })))
        )
      )
    )
  );

  deleteVote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VoteActions.deleteVote),
      tap(() => this.spinner.show()),
      mergeMap(action =>
        this.voteService.deleteVote(action.id).pipe(
          mergeMap(() => {
            this.spinner.hide();
            this.toastr.success('Vote deleted and results updated.', 'Success');
            return [
              VoteActions.deleteVoteSuccess({ id: action.id, pollId: action.pollId }),
              VoteActions.loadResults({ pollId: action.pollId })
            ];
          }),
          catchError(error => {
            this.spinner.hide();
            const errorMsg = error.error?.message || 'Failed to delete vote.';
            this.toastr.error(errorMsg, 'Error');
            return of(VoteActions.deleteVoteFailure({ error: errorMsg }));
          })
        )
      )
    )
  );

  alterVote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VoteActions.alterVote),
      tap(() => this.spinner.show()),
      mergeMap(action =>
        this.voteService.alterVote(action.id, action.newOptionId).pipe(
          mergeMap(() => {
            this.spinner.hide();
            this.toastr.success('Vote altered and results updated.', 'Success');
            return [
              VoteActions.alterVoteSuccess({ id: action.id, newOptionId: action.newOptionId, pollId: action.pollId }),
              VoteActions.loadResults({ pollId: action.pollId })
            ];
          }),
          catchError(error => {
            this.spinner.hide();
            const errorMsg = error.error?.message || 'Failed to alter vote.';
            this.toastr.error(errorMsg, 'Error');
            return of(VoteActions.alterVoteFailure({ error: errorMsg }));
          })
        )
      )
    )
  );
}
