import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as PollActions from '../../store/poll/poll.actions';
import * as VoteActions from '../../store/vote/vote.actions';
import { selectActivePolls, selectPollLoading } from '../../store/poll/poll.selectors';
import { selectMyVotesByPoll, selectCurrentResults } from '../../store/vote/vote.selectors';
import { PollService } from '../../core/services/poll.service';
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
        <span>📭</span>
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
              Submit Vote ⚡
            </button>
          </div>

          <!-- Case 2: User has voted in this poll (Show Own Vote + Results) -->
          <ng-template #votedTemplate>
            <div class="poll-body voted-state">
              <div class="user-vote-badge">
                <span>✓</span> You voted for: <strong>{{ getVotedOptionText(poll.id) }}</strong>
              </div>

              <div class="results-preview">
                <h5>Current Standings</h5>
                
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
      font-size: 1.8rem;
      margin-bottom: 6px;
    }
    .header-section p {
      color: var(--text-secondary);
      margin: 0;
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
      border: 4px solid rgba(255, 255, 255, 0.1);
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
      padding: 60px 20px;
      text-align: center;
    }
    .empty-state span {
      font-size: 3rem;
      margin-bottom: 16px;
    }
    .empty-state h4 {
      font-size: 1.35rem;
      margin-bottom: 8px;
    }
    .empty-state p {
      color: var(--text-secondary);
      max-width: 400px;
      margin: 0;
    }
    .polls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
      gap: 24px;
    }
    @media (max-width: 600px) {
      .polls-grid {
        grid-template-columns: 1fr;
      }
    }
    .poll-card {
      padding: 30px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .poll-header h4 {
      font-size: 1.25rem;
      margin-bottom: 10px;
      line-height: 1.4;
    }
    .poll-desc {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .options-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }
    .option-label {
      display: flex;
      align-items: center;
      position: relative;
      padding: 12px 16px 12px 48px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--surface-border);
      border-radius: 10px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.95rem;
      transition: all 0.2s;
    }
    .option-label:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.15);
    }
    .option-label input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
    }
    .custom-radio {
      position: absolute;
      left: 16px;
      height: 20px;
      width: 20px;
      background-color: rgba(255, 255, 255, 0.05);
      border: 2px solid var(--surface-border);
      border-radius: 50%;
      transition: all 0.2s;
    }
    .option-label:hover input ~ .custom-radio {
      border-color: var(--primary-color);
    }
    .option-label input:checked ~ .custom-radio {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
    .custom-radio:after {
      content: "";
      position: absolute;
      display: none;
      top: 5px;
      left: 5px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: white;
    }
    .option-label input:checked ~ .custom-radio:after {
      display: block;
    }
    .option-text {
      line-height: 1.2;
    }
    .submit-vote-btn {
      width: 100%;
    }
    .user-vote-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: #a7f3d0;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 24px;
    }
    .user-vote-badge span {
      background: #10b981;
      color: white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: bold;
    }
    .results-preview h5 {
      font-size: 0.95rem;
      color: var(--text-secondary);
      margin-bottom: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .result-row {
      margin-bottom: 12px;
    }
    .result-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      margin-bottom: 6px;
      font-weight: 600;
    }
    .result-text {
      color: var(--text-main);
    }
    .result-pct {
      color: var(--text-secondary);
    }
    .progress-container {
      height: 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-color) 0%, var(--accent-color) 100%);
      border-radius: 4px;
    }
    .total-count {
      text-align: right;
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-top: 14px;
      font-weight: 600;
    }
    .mini-loading {
      font-size: 0.85rem;
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

  // Tracks selected option for each poll
  selectedOptions: { [pollId: number]: number } = {};
  
  // Local store for vote results of polls user voted on
  pollResults: { [pollId: number]: PollResult } = {};
  userVotes: { [pollId: number]: string } = {};

  ngOnInit(): void {
    this.store.dispatch(PollActions.loadActivePolls());
    this.store.dispatch(VoteActions.loadMyVotes());

    // Subscribe to vote maps to automatically fetch results for voted polls
    this.myVotesByPoll$.subscribe(votesMap => {
      Object.keys(votesMap).forEach(key => {
        const pollId = Number(key);
        const userVote = votesMap[pollId];
        this.userVotes[pollId] = userVote.votedOptionText;
        
        // Fetch results for this poll
        if (!this.pollResults[pollId]) {
          this.voteService.getResults(pollId).subscribe(results => {
            this.pollResults[pollId] = results;
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
