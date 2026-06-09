import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VoteState } from './vote.reducer';

export const selectVoteState = createFeatureSelector<VoteState>('vote');

export const selectCurrentResults = createSelector(
  selectVoteState,
  (state: VoteState) => state.currentResults
);

export const selectMyVotes = createSelector(
  selectVoteState,
  (state: VoteState) => state.myVotes
);

export const selectMyVotesByPoll = createSelector(
  selectVoteState,
  (state: VoteState) => state.myVotesByPoll
);

// Selector to get specific vote by pollId
export const selectMyVoteForPoll = (pollId: number) => createSelector(
  selectMyVotesByPoll,
  (myVotesByPoll) => myVotesByPoll[pollId] || null
);

export const selectVoteLoading = createSelector(
  selectVoteState,
  (state: VoteState) => state.loading
);

export const selectVoteError = createSelector(
  selectVoteState,
  (state: VoteState) => state.error
);
