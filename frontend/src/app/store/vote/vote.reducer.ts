import { createReducer, on } from '@ngrx/store';
import * as VoteActions from './vote.actions';
import { PollResult, UserVote } from '../../core/models/poll.model';

export interface VoteState {
  currentResults: PollResult | null;
  myVotes: UserVote[];
  myVotesByPoll: { [pollId: number]: UserVote };
  loading: boolean;
  error: string | null;
}

export const initialVoteState: VoteState = {
  currentResults: null,
  myVotes: [],
  myVotesByPoll: {},
  loading: false,
  error: null
};

export const voteReducer = createReducer(
  initialVoteState,
  on(VoteActions.castVote, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(VoteActions.castVoteSuccess, (state, { pollId, optionId }) => ({
    ...state,
    loading: false,
    error: null
  })),
  on(VoteActions.castVoteFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(VoteActions.loadResults, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(VoteActions.loadResultsSuccess, (state, { results }) => ({
    ...state,
    currentResults: results,
    loading: false,
    error: null
  })),
  on(VoteActions.loadResultsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(VoteActions.loadMyVotes, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(VoteActions.loadMyVotesSuccess, (state, { votes }) => {
    const map: { [pollId: number]: UserVote } = {};
    votes.forEach(v => {
      map[v.pollId] = v;
    });
    return {
      ...state,
      myVotes: votes,
      myVotesByPoll: { ...state.myVotesByPoll, ...map },
      loading: false,
      error: null
    };
  }),
  on(VoteActions.loadMyVotesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(VoteActions.loadMyVoteOnPollSuccess, (state, { vote }) => ({
    ...state,
    myVotesByPoll: {
      ...state.myVotesByPoll,
      [vote.pollId]: vote
    }
  }))
);
