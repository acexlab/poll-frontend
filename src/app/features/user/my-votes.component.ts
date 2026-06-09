import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as VoteActions from '../../store/vote/vote.actions';
import { selectMyVotes, selectVoteLoading } from '../../store/vote/vote.selectors';

@Component({
  selector: 'app-my-votes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="my-votes-container">
      <div class="header-section">
        <h3>My Voting History</h3>
        <p>A history of all the decisions you have participated in.</p>
      </div>

      <div *ngIf="loading$ | async" class="loading-state">
        <div class="spinner-ring"></div>
        <p>Loading your votes...</p>
      </div>

      <div *ngIf="(myVotes$ | async)?.length === 0 && !(loading$ | async)" class="empty-state glass-panel">
        <h4>No Votes Cast Yet</h4>
        <p>You haven't participated in any polls yet. Go to active polls and start voting!</p>
      </div>

      <div class="history-list" *ngIf="!(loading$ | async)">
        <div *ngFor="let vote of myVotes$ | async" class="history-item glass-panel glass-panel-hover">
          <div class="history-left">
            <div class="vote-details">
              <h4>{{ vote.pollTitle }}</h4>
              <p>Option Chosen: <span class="chosen-opt">{{ vote.votedOptionText }}</span></p>
            </div>
          </div>
          <div class="history-right">
            <span class="voted-date">{{ vote.votedAt | date:'mediumDate' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-votes-container {
      max-width: 800px;
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
      border-top-color: var(--accent-color);
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
    .history-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 24px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
    }
    @media (max-width: 600px) {
      .history-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }
    .history-left {
      display: flex;
      align-items: center;
    }
    .vote-details h4 {
      font-size: 1.05rem;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .vote-details p {
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin: 0;
    }
    .chosen-opt {
      color: #0f172a;
      font-weight: 700;
    }
    .voted-date {
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-weight: 600;
      background: #f1f5f9;
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }
  `]
})
export class MyVotesComponent implements OnInit {
  private store = inject(Store);
  
  myVotes$ = this.store.select(selectMyVotes);
  loading$ = this.store.select(selectVoteLoading);

  ngOnInit(): void {
    this.store.dispatch(VoteActions.loadMyVotes());
  }
}
