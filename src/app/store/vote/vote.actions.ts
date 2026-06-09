import { createAction, props } from '@ngrx/store';
import { PollResult, UserVote } from '../../core/models/poll.model';

// Cast Vote
export const castVote = createAction(
  '[Vote] Cast Vote',
  props<{ pollId: number; optionId: number }>()
);

export const castVoteSuccess = createAction(
  '[Vote] Cast Vote Success',
  props<{ pollId: number; optionId: number }>()
);

export const castVoteFailure = createAction(
  '[Vote] Cast Vote Failure',
  props<{ error: string }>()
);

// Load Poll Results
export const loadResults = createAction(
  '[Vote] Load Results',
  props<{ pollId: number }>()
);

export const loadResultsSuccess = createAction(
  '[Vote] Load Results Success',
  props<{ results: PollResult }>()
);

export const loadResultsFailure = createAction(
  '[Vote] Load Results Failure',
  props<{ error: string }>()
);

// Load My Votes (History)
export const loadMyVotes = createAction(
  '[Vote] Load My Votes'
);

export const loadMyVotesSuccess = createAction(
  '[Vote] Load My Votes Success',
  props<{ votes: UserVote[] }>()
);

export const loadMyVotesFailure = createAction(
  '[Vote] Load My Votes Failure',
  props<{ error: string }>()
);

// Load My Vote on a Specific Poll
export const loadMyVoteOnPoll = createAction(
  '[Vote] Load My Vote On Poll',
  props<{ pollId: number }>()
);

export const loadMyVoteOnPollSuccess = createAction(
  '[Vote] Load My Vote On Poll Success',
  props<{ vote: UserVote }>()
);

export const loadMyVoteOnPollFailure = createAction(
  '[Vote] Load My Vote On Poll Failure',
  props<{ error: string }>()
);

// Delete Vote (Admin)
export const deleteVote = createAction(
  '[Vote] Delete Vote',
  props<{ id: number; pollId: number }>()
);

export const deleteVoteSuccess = createAction(
  '[Vote] Delete Vote Success',
  props<{ id: number; pollId: number }>()
);

export const deleteVoteFailure = createAction(
  '[Vote] Delete Vote Failure',
  props<{ error: string }>()
);

// Alter Vote (Admin)
export const alterVote = createAction(
  '[Vote] Alter Vote',
  props<{ id: number; newOptionId: number; pollId: number }>()
);

export const alterVoteSuccess = createAction(
  '[Vote] Alter Vote Success',
  props<{ id: number; newOptionId: number; pollId: number }>()
);

export const alterVoteFailure = createAction(
  '[Vote] Alter Vote Failure',
  props<{ error: string }>()
);
