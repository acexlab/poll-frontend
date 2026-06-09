import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PollResult, UserVote } from '../models/poll.model';

@Injectable({
  providedIn: 'root'
})
export class VoteService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5273/api/votes';

  castVote(pollId: number, pollOptionId: number): Observable<any> {
    return this.http.post<any>(this.apiUrl, { pollId, pollOptionId });
  }

  getResults(pollId: number): Observable<PollResult> {
    return this.http.get<PollResult>(`${this.apiUrl}/results/${pollId}`);
  }

  getMyVotes(): Observable<UserVote[]> {
    return this.http.get<UserVote[]>(`${this.apiUrl}/my-votes`);
  }

  getMyVoteOnPoll(pollId: number): Observable<UserVote> {
    return this.http.get<UserVote>(`${this.apiUrl}/my-vote/${pollId}`);
  }
}
