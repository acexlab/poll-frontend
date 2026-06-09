import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import * as PollActions from '../../store/poll/poll.actions';
import * as VoteActions from '../../store/vote/vote.actions';
import { selectActivePolls, selectPollLoading } from '../../store/poll/poll.selectors';
import { selectMyVotesByPoll } from '../../store/vote/vote.selectors';
import { VoteService } from '../../core/services/vote.service';
import { PollResult } from '../../core/models/poll.model';

@Component({
  selector: 'app-active-polls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="polls-container">
      <div class="header-section">
        <h3>Available Polls</h3>
        <p>Choose an active poll and make your voice heard. You can vote once per poll.</p>
      </div>

      <div *ngIf="loading$ | async" class="loading-state">
        <div class="spinner-ring"></div>
        <p>Loading polls...</p>
      </div>

      <div *ngIf="(polls$ | async)?.length === 0 && !(loading$ | async)" class="empty-state glass-panel">
        <h4>No Active Polls</h4>
        <p>There are currently no active polls open for voting. Check back later!</p>
      </div>

      <div class="polls-grid" *ngIf="!(loading$ | async)">
        <div *ngFor="let poll of polls$ | async" class="glass-panel poll-card glass-panel-hover">
          <div class="poll-header">
            <h4>{{ poll.title }}</h4>
            <p class="poll-desc">{{ poll.description }}</p>
          </div>

          <!-- Case 1: User has not voted in this poll -->
          <div *ngIf="!hasVoted(poll.id); else votedTemplate" class="poll-body">
            <div class="options-list">
              <label *ngFor="let option of poll.options" class="option-label">
                <input 
                  type="radio" 
                  [name]="'poll_' + poll.id" 
                  [value]="option.id" 
                  [(ngModel)]="selectedOptions[poll.id]"
                />
                <span class="custom-radio"></span>
                <span class="option-text">{{ option.optionText }}</span>
              </label>
            </div>
            
            <button 
              (click)="onVote(poll.id)" 
              class="glass-btn glass-btn-primary submit-vote-btn"
              [disabled]="!selectedOptions[poll.id]"
              [class.glass-btn-disabled]="!selectedOptions[poll.id]"
            >
              Submit Vote
            </button>
          </div>

          <!-- Case 2: User has voted in this poll (Show Own Vote + Results) -->
          <ng-template #votedTemplate>
            <div class="poll-body voted-state">
              <div class="user-vote-badge">
                You voted for: <strong>{{ getVotedOptionText(poll.id) }}</strong>
              </div>

              <div class="results-preview">
                <h5>Current Standings</h5>
                
                <div *ngIf="poll.showResults; else resultsHidden">
                  <div class="results-bars" *ngIf="pollResults[poll.id] as result; else loadingResults">
                    <div *ngFor="let item of result.results" class="result-row">
                      <div class="result-info">
                        <span class="result-text">{{ item.optionText }}</span>
                        <span class="result-pct">{{ item.percentage }}% ({{ item.voteCount }} votes)</span>
                      </div>
                      <div class="progress-container">
                        <div class="progress-bar" [style.width.%]="item.percentage"></div>
                      </div>
                    </div>
                    <div class="total-count">Total Votes: {{ result.totalVotes }}</div>
                  </div>

                  <ng-template #loadingResults>
                    <div class="mini-loading">Loading results...</div>
                  </ng-template>
                </div>

                <ng-template #resultsHidden>
                  <div class="results-hidden-msg">
                    Results are currently hidden by the administrator.
                  </div>
                </ng-template>
              </div>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .polls-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .header-section {
      margin-bottom: 24px;
    }
    .header-section h3 {
      font-size: 1.5rem;
      margin-bottom: 6px;
      color: #0f172a;
    }
    .header-section p {
      color: var(--text-secondary);
      margin: 0;
      font-size: 0.9rem;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
    }
    .spinner-ring {
      width: 40px;
      height: 40px;
      border: 4px solid #f1f5f9;
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      text-align: center;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
    }
    .empty-state h4 {
      font-size: 1.15rem;
      margin-bottom: 8px;
      color: #0f172a;
    }
    .empty-state p {
      color: var(--text-secondary);
      max-width: 400px;
      margin: 0;
      font-size: 0.85rem;
    }
    .polls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(440px, 1fr));
      gap: 20px;
    }
    @media (max-width: 600px) {
      .polls-grid {
        grid-template-columns: 1fr;
      }
    }
    .poll-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .poll-header h4 {
      font-size: 1.15rem;
      color: #0f172a;
      margin-bottom: 8px;
      line-height: 1.4;
    }
    .poll-desc {
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .options-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }
    .option-label {
      display: flex;
      align-items: center;
      position: relative;
      padding: 10px 14px 10px 42px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.85rem;
      transition: all 0.15s;
    }
    .option-label:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }
    .option-label input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
    }
    .custom-radio {
      position: absolute;
      left: 14px;
      height: 16px;
      width: 16px;
      background-color: #ffffff;
      border: 2px solid #cbd5e1;
      border-radius: 50%;
      transition: all 0.15s;
    }
    .option-label:hover input ~ .custom-radio {
      border-color: #0f172a;
    }
    .option-label input:checked ~ .custom-radio {
      background-color: #ffffff;
      border-color: #0f172a;
    }
    .custom-radio:after {
      content: "";
      position: absolute;
      display: none;
      top: 3px;
      left: 3px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #0f172a;
    }
    .option-label input:checked ~ .custom-radio:after {
      display: block;
    }
    .option-text {
      line-height: 1.2;
      color: #0f172a;
    }
    .submit-vote-btn {
      width: 100%;
    }
    .user-vote-badge {
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #0f172a;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 20px;
    }
    .results-preview h5 {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .result-row {
      margin-bottom: 10px;
    }
    .result-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .result-text {
      color: #0f172a;
    }
    .result-pct {
      color: var(--text-secondary);
    }
    .progress-container {
      height: 6px;
      background: #f1f5f9;
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background: #0f172a;
      border-radius: 3px;
    }
    .total-count {
      text-align: right;
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 10px;
      font-weight: 600;
    }
    .mini-loading {
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-style: italic;
    }
  `]
})
export class ActivePollsComponent implements OnInit {
  private store = inject(Store);
  private voteService = inject(VoteService);

  polls$ = this.store.select(selectActivePolls);
  loading$ = this.store.select(selectPollLoading);
  myVotesByPoll$ = this.store.select(selectMyVotesByPoll);

  selectedOptions: { [pollId: number]: number } = {};
  pollResults: { [pollId: number]: PollResult } = {};
  userVotes: { [pollId: number]: string } = {};

  ngOnInit(): void {
    this.store.dispatch(PollActions.loadActivePolls());
    this.store.dispatch(VoteActions.loadMyVotes());

    combineLatest([this.polls$, this.myVotesByPoll$]).subscribe(([polls, votesMap]) => {
      Object.keys(votesMap).forEach(key => {
        const pollId = Number(key);
        const userVote = votesMap[pollId];
        this.userVotes[pollId] = userVote.votedOptionText;
        
        const poll = polls.find(p => p.id === pollId);
        if (poll && poll.showResults && !this.pollResults[pollId]) {
          this.voteService.getResults(pollId).subscribe({
            next: results => {
              this.pollResults[pollId] = results;
            },
            error: err => {
              console.error('Failed to load poll results', err);
            }
          });
        }
      });
    });
  }

  hasVoted(pollId: number): boolean {
    return !!this.userVotes[pollId];
  }

  getVotedOptionText(pollId: number): string {
    return this.userVotes[pollId] || '';
  }

  onVote(pollId: number): void {
    const optionId = this.selectedOptions[pollId];
    if (optionId) {
      this.store.dispatch(VoteActions.castVote({ pollId, optionId }));
    }
  }
}
