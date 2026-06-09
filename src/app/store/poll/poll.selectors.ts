import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PollState } from './poll.reducer';

export const selectPollState = createFeatureSelector<PollState>('poll');

export const selectAllPolls = createSelector(
  selectPollState,
  (state: PollState) => state.polls
);

export const selectActivePolls = createSelector(
  selectPollState,
  (state: PollState) => state.activePolls
);

export const selectPollTotal = createSelector(
  selectPollState,
  (state: PollState) => state.totalRecords
);

export const selectPollPage = createSelector(
  selectPollState,
  (state: PollState) => state.page
);

export const selectPollPageSize = createSelector(
  selectPollState,
  (state: PollState) => state.pageSize
);

export const selectPollLoading = createSelector(
  selectPollState,
  (state: PollState) => state.loading
);

export const selectPollError = createSelector(
  selectPollState,
  (state: PollState) => state.error
);
