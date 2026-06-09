import { createReducer, on } from '@ngrx/store';
import * as PollActions from './poll.actions';
import { Poll } from '../../core/models/poll.model';

export interface PollState {
  polls: Poll[];
  activePolls: Poll[];
  totalRecords: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

export const initialPollState: PollState = {
  polls: [],
  activePolls: [],
  totalRecords: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null
};

export const pollReducer = createReducer(
  initialPollState,
  on(PollActions.loadPolls, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(PollActions.loadPollsSuccess, (state, { result }) => ({
    ...state,
    polls: result.data,
    totalRecords: result.totalRecords,
    page: result.page,
    pageSize: result.pageSize,
    loading: false,
    error: null
  })),
  on(PollActions.loadPollsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(PollActions.loadActivePolls, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(PollActions.loadActivePollsSuccess, (state, { polls }) => ({
    ...state,
    activePolls: polls,
    loading: false,
    error: null
  })),
  on(PollActions.loadActivePollsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(PollActions.createPoll, PollActions.createFifaPoll, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(PollActions.createPollSuccess, PollActions.createFifaPollSuccess, (state, { poll }) => ({
    ...state,
    polls: [poll, ...state.polls],
    totalRecords: state.totalRecords + 1,
    loading: false,
    error: null
  })),
  on(PollActions.createPollFailure, PollActions.createFifaPollFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(PollActions.enablePollSuccess, (state, { id }) => ({
    ...state,
    polls: state.polls.map(p => p.id === id ? { ...p, isEnabled: true } : p),
    activePolls: state.activePolls.map(p => p.id === id ? { ...p, isEnabled: true } : p)
  })),
  on(PollActions.disablePollSuccess, (state, { id }) => ({
    ...state,
    polls: state.polls.map(p => p.id === id ? { ...p, isEnabled: false } : p),
    activePolls: state.activePolls.filter(p => p.id !== id)
  }))
);
