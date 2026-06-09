import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as PollActions from '../../store/poll/poll.actions';
import { selectAllPolls, selectPollTotal, selectPollPage, selectPollPageSize, selectPollLoading } from '../../store/poll/poll.selectors';
import { VoteService } from '../../core/services/vote.service';
import { Poll, PollResult } from '../../core/models/poll.model';

@Component({
  selector: 'app-poll-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="poll-list-container">
      <div class="flex-between header-section">
        <div>
          <h3>Poll Administration</h3>
          <p>Activate, deactivate, and review results for all system polls.</p>
        </div>
      </div>

      <div *ngIf="loading$ | async" class="loading-state">
        <div class="spinner-ring"></div>
        <p>Loading polls...</p>
      </div>

      <div class="polls-grid" *ngIf="!(loading$ | async)">
        <div *ngFor="let poll of polls$ | async" class="glass-panel poll-item-card">
          <div class="poll-header-info">
            <div class="flex-between">
              <span class="badge" [class.badge-active]="poll.isEnabled" [class.badge-inactive]="!poll.isEnabled">
                {{ poll.isEnabled ? 'Enabled' : 'Disabled' }}
              </span>
              <span class="created-at">{{ poll.createdAt | date:'shortDate' }}</span>
            </div>
            <h4>{{ poll.title }}</h4>
            <p>{{ poll.description }}</p>
          </div>

          <div class="poll-actions">
            <!-- Status Toggle -->
            <button 
              *ngIf="!poll.isEnabled" 
              (click)="onEnable(poll.id)" 
              class="glass-btn glass-btn-primary btn-sm"
            >
              Enable Poll
            </button>
            <button 
              *ngIf="poll.isEnabled" 
              (click)="onDisable(poll.id)" 
              class="glass-btn glass-btn-secondary btn-sm text-red"
            >
              Disable Poll
            </button>

            <!-- Results Trigger -->
            <button (click)="viewResults(poll)" class="glass-btn glass-btn-secondary btn-sm">
              View Results 📊
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div class="flex-row-center pagination-footer" *ngIf="!(loading$ | async)">
        <span class="total-label">Total: {{ total$ | async }} polls</span>
        <div class="pager-btns">
          <button 
            [disabled]="(page$ | async) === 1" 
            (click)="onPageChange(-1)" 
            class="glass-btn glass-btn-secondary btn-sm"
          >
            ◀ Prev
          </button>
          <span class="page-indicator">Page {{ page$ | async }}</span>
          <button 
            [disabled]="((page$ | async)! * (pageSize$ | async)!) >= (total$ | async)!" 
            (click)="onPageChange(1)" 
            class="glass-btn glass-btn-secondary btn-sm"
          >
            Next ▶
          </button>
        </div>
      </div>

      <!-- Modal Overlay for Results -->
      <div class="modal-backdrop" *ngIf="selectedPoll">
        <div class="glass-panel modal-card">
          <div class="flex-between modal-header">
            <h4>Results: {{ selectedPoll.title }}</h4>
            <button (click)="closeResults()" class="close-btn">×</button>
          </div>

          <div class="modal-body" *ngIf="currentResults; else loadingResults">
            <div class="total-votes-banner">
              Total Votes Counted: <strong>{{ currentResults.totalVotes }}</strong>
            </div>

            <div class="results-bars">
              <div *ngFor="let item of currentResults.results" class="result-row">
                <div class="result-info">
                  <span class="opt-text">{{ item.optionText }}</span>
                  <span class="opt-pct">{{ item.percentage }}% ({{ item.voteCount }} votes)</span>
                </div>
                <div class="progress-container">
                  <div class="progress-bar" [style.width.%]="item.percentage"></div>
                </div>
              </div>
            </div>
          </div>
          <ng-template #loadingResults>
            <div class="modal-loading">Calculating results...</div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .poll-list-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
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
    .polls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    .poll-item-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 200px;
    }
    .poll-header-info h4 {
      font-size: 1.15rem;
      margin: 12px 0 6px 0;
      line-height: 1.4;
    }
    .poll-header-info p {
      color: var(--text-secondary);
      font-size: 0.85rem;
      line-height: 1.4;
      margin-bottom: 20px;
    }
    .created-at {
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-weight: 600;
    }
    .poll-actions {
      display: flex;
      gap: 10px;
      margin-top: auto;
    }
    .btn-sm {
      padding: 8px 14px;
      font-size: 0.8rem;
      border-radius: 8px;
    }
    .text-red {
      color: #fda4af;
      border-color: rgba(244, 63, 94, 0.3);
      background: rgba(244, 63, 94, 0.05);
    }
    .text-red:hover {
      background: rgba(244, 63, 94, 0.15);
    }
    .pagination-footer {
      justify-content: space-between;
      padding-top: 16px;
      border-top: 1px solid var(--surface-border);
    }
    .total-label {
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.9rem;
    }
    .pager-btns {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .page-indicator {
      font-weight: 700;
      font-size: 0.9rem;
    }
    /* Modal styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(2, 6, 23, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .modal-card {
      width: 90%;
      max-width: 500px;
      padding: 30px;
    }
    .modal-header {
      margin-bottom: 20px;
    }
    .modal-header h4 {
      margin: 0;
      font-size: 1.25rem;
    }
    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
    .close-btn:hover {
      color: var(--text-main);
    }
    .total-votes-banner {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 0.9rem;
      text-align: center;
      margin-bottom: 20px;
    }
    .results-bars {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .result-row {
      margin-bottom: 8px;
    }
    .result-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .opt-text {
      color: var(--text-main);
    }
    .opt-pct {
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
    .modal-loading {
      text-align: center;
      font-style: italic;
      color: var(--text-secondary);
      padding: 20px;
    }
  `]
})
export class PollListComponent implements OnInit {
  private store = inject(Store);
  private voteService = inject(VoteService);

  polls$ = this.store.select(selectAllPolls);
  total$ = this.store.select(selectPollTotal);
  page$ = this.store.select(selectPollPage);
  pageSize$ = this.store.select(selectPollPageSize);
  loading$ = this.store.select(selectPollLoading);

  currentPage = 1;
  currentPageSize = 10;
  
  // Results view variables
  selectedPoll: Poll | null = null;
  currentResults: PollResult | null = null;

  ngOnInit(): void {
    this.page$.subscribe(p => this.currentPage = p);
    this.pageSize$.subscribe(ps => this.currentPageSize = ps);
    this.loadCurrentPage();
  }

  loadCurrentPage(): void {
    this.store.dispatch(PollActions.loadPolls({ page: this.currentPage, pageSize: this.currentPageSize }));
  }

  onPageChange(offset: number): void {
    const targetPage = this.currentPage + offset;
    this.store.dispatch(PollActions.loadPolls({ page: targetPage, pageSize: this.currentPageSize }));
  }

  onEnable(id: number): void {
    this.store.dispatch(PollActions.enablePoll({ id }));
  }

  onDisable(id: number): void {
    this.store.dispatch(PollActions.disablePoll({ id }));
  }

  viewResults(poll: Poll): void {
    this.selectedPoll = poll;
    this.currentResults = null;
    this.voteService.getResults(poll.id).subscribe(res => {
      this.currentResults = res;
    });
  }

  closeResults(): void {
    this.selectedPoll = null;
    this.currentResults = null;
  }
}
