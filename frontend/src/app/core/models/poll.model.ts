export interface PollOption {
  id: number;
  pollId: number;
  optionText: string;
}

export interface Poll {
  id: number;
  title: string;
  description: string;
  isEnabled: boolean;
  createdBy: number;
  createdAt: string;
  options: PollOption[];
}

export interface CreatePoll {
  title: string;
  description: string;
  options: string[];
}

export interface PaginatedResult<T> {
  totalRecords: number;
  page: number;
  pageSize: number;
  data: T[];
}

export interface VoteResultItem {
  optionId: number;
  optionText: string;
  voteCount: number;
  percentage: number;
}

export interface PollResult {
  pollId: number;
  pollTitle: string;
  totalVotes: number;
  results: VoteResultItem[];
}

export interface UserVote {
  pollId: number;
  pollTitle: string;
  votedOptionId: number;
  votedOptionText: string;
  votedAt: string;
}
