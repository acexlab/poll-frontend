import { createAction, props } from '@ngrx/store';
import { Poll, CreatePoll, PaginatedResult } from '../../core/models/poll.model';

// Load Paginated Polls (Admin)
export const loadPolls = createAction(
  '[Poll] Load Polls',
  props<{ page: number; pageSize: number }>()
);

export const loadPollsSuccess = createAction(
  '[Poll] Load Polls Success',
  props<{ result: PaginatedResult<Poll> }>()
);

export const loadPollsFailure = createAction(
  '[Poll] Load Polls Failure',
  props<{ error: string }>()
);

// Load Active Polls (User)
export const loadActivePolls = createAction(
  '[Poll] Load Active Polls'
);

export const loadActivePollsSuccess = createAction(
  '[Poll] Load Active Polls Success',
  props<{ polls: Poll[] }>()
);

export const loadActivePollsFailure = createAction(
  '[Poll] Load Active Polls Failure',
  props<{ error: string }>()
);

// Create Custom Poll
export const createPoll = createAction(
  '[Poll] Create Poll',
  props<{ poll: CreatePoll }>()
);

export const createPollSuccess = createAction(
  '[Poll] Create Poll Success',
  props<{ poll: Poll }>()
);

export const createPollFailure = createAction(
  '[Poll] Create Poll Failure',
  props<{ error: string }>()
);

// Create FIFA Poll
export const createFifaPoll = createAction(
  '[Poll] Create FIFA Poll'
);

export const createFifaPollSuccess = createAction(
  '[Poll] Create FIFA Poll Success',
  props<{ poll: Poll }>()
);

export const createFifaPollFailure = createAction(
  '[Poll] Create FIFA Poll Failure',
  props<{ error: string }>()
);

// Enable Poll
export const enablePoll = createAction(
  '[Poll] Enable Poll',
  props<{ id: number }>()
);

export const enablePollSuccess = createAction(
  '[Poll] Enable Poll Success',
  props<{ id: number }>()
);

export const enablePollFailure = createAction(
  '[Poll] Enable Poll Failure',
  props<{ error: string }>()
);

// Disable Poll
export const disablePoll = createAction(
  '[Poll] Disable Poll',
  props<{ id: number }>()
);

export const disablePollSuccess = createAction(
  '[Poll] Disable Poll Success',
  props<{ id: number }>()
);

export const disablePollFailure = createAction(
  '[Poll] Disable Poll Failure',
  props<{ error: string }>()
);

// Delete Poll
export const deletePoll = createAction(
  '[Poll] Delete Poll',
  props<{ id: number }>()
);

export const deletePollSuccess = createAction(
  '[Poll] Delete Poll Success',
  props<{ id: number }>()
);

export const deletePollFailure = createAction(
  '[Poll] Delete Poll Failure',
  props<{ error: string }>()
);
