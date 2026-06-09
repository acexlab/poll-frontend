import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as PollActions from '../../store/poll/poll.actions';
import { selectAllPolls, selectPollTotal, selectPollPage, selectPollPageSize, selectPollLoading } from '../../store/poll/poll.selectors';
import { selectCurrentResults } from '../../store/vote/vote.selectors';
import * as VoteActions from '../../store/vote/vote.actions';
import { Poll, PollResult, Participant } from '../../core/models/poll.model';

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
            <div class="flex-between" style="flex-wrap: wrap; gap: 6px;">
              <div style="display: flex; gap: 6px;">
                <span class="badge" [class.badge-active]="poll.isEnabled" [class.badge-inactive]="!poll.isEnabled">
                  {{ poll.isEnabled ? 'Enabled' : 'Disabled' }}
                </span>
                <span class="badge" [class.badge-results-active]="poll.showResults" [class.badge-results-inactive]="!poll.showResults">
                  Results: {{ poll.showResults ? 'Visible' : 'Hidden' }}
                </span>
              </div>
              <span class="created-at">{{ poll.createdAt | date:'mediumDate' }}</span>
            </div>
            <h4>{{ poll.title }}</h4>
            <p>{{ poll.description }}</p>
          </div>

          <div class="poll-actions" style="flex-wrap: wrap; gap: 8px;">
            <!-- Status Toggle -->
            <button 
              *ngIf="!poll.isEnabled" 
              (click)="onEnable(poll.id)" 
              class="glass-btn glass-btn-primary btn-sm"
            >
              Enable
            </button>
            <button 
              *ngIf="poll.isEnabled" 
              (click)="onDisable(poll.id)" 
              class="glass-btn glass-btn-secondary btn-sm text-red"
            >
              Disable
            </button>

            <!-- Results Visibility Toggle -->
            <button 
              *ngIf="!poll.showResults" 
              (click)="onEnableResults(poll.id)" 
              class="glass-btn glass-btn-primary btn-sm"
            >
              Enable Results
            </button>
            <button 
              *ngIf="poll.showResults" 
              (click)="onDisableResults(poll.id)" 
              class="glass-btn glass-btn-secondary btn-sm text-red"
            >
              Disable Results
            </button>

            <!-- Results Trigger -->
            <button (click)="viewResults(poll)" class="glass-btn glass-btn-secondary btn-sm">
              View Results
            </button>

            <!-- View Participants Trigger -->
            <button (click)="viewParticipants(poll)" class="glass-btn glass-btn-secondary btn-sm">
              View Participants
            </button>

            <!-- Delete Poll -->
            <button (click)="onDeletePoll(poll.id)" class="glass-btn glass-btn-secondary btn-sm text-red">
              Delete
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
            [class.glass-btn-disabled]="(page$ | async) === 1"
          >
            Previous
          </button>
          <span class="page-indicator">Page {{ page$ | async }}</span>
          <button 
            [disabled]="((page$ | async)! * (pageSize$ | async)!) >= (total$ | async)!" 
            (click)="onPageChange(1)" 
            class="glass-btn glass-btn-secondary btn-sm"
            [class.glass-btn-disabled]="((page$ | async)! * (pageSize$ | async)!) >= (total$ | async)!"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Modal Overlay for Results -->
      <div class="modal-backdrop" *ngIf="selectedPoll">
        <div class="glass-panel modal-card">
          <div class="flex-between modal-header">
            <h4>{{ selectedPoll.title }}</h4>
            <button (click)="closeResults()" class="close-btn-text">Close</button>
          </div>

          <!-- Modal Tabs -->
          <div class="modal-tabs" *ngIf="selectedPoll">
            <button 
              class="modal-tab-btn" 
              [class.active-tab]="activeModalTab === 'results'" 
              (click)="activeModalTab = 'results'"
            >
              Results
            </button>
            <button 
              class="modal-tab-btn" 
              [class.active-tab]="activeModalTab === 'participants'" 
              (click)="activeModalTab = 'participants'"
            >
              Participants
            </button>
          </div>

          <div class="modal-body" *ngIf="currentResults$ | async as currentResults; else loadingResults">
            <!-- Results Tab Content -->
            <div *ngIf="activeModalTab === 'results'">
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

            <!-- Participants Tab Content -->
            <div *ngIf="activeModalTab === 'participants'" class="participants-section">
              <div class="flex-between participants-section-header">
                <h5 style="margin: 0;">Voter Choices</h5>
                <div class="filter-wrapper">
                  <label for="optionFilter">Filter Choice:</label>
                  <select id="optionFilter" class="filter-select" (change)="onFilterChange($event)">
                    <option value="">All Options</option>
                    <option *ngFor="let opt of currentResults.results" [value]="opt.optionText">{{ opt.optionText }}</option>
                  </select>
                </div>
              </div>

              <div *ngIf="getFilteredParticipants(currentResults.participants) as filteredParticipants">
                <div *ngIf="filteredParticipants.length > 0; else noParticipants">
                  <div class="participants-list">
                    <div *ngFor="let voter of getPaginatedParticipants(currentResults.participants)" class="participant-row">
                      <div class="participant-info">
                        <span class="voter-name">{{ voter.username }}</span>
                        <span class="voted-time">{{ voter.votedAt | date:'shortTime' }}</span>
                      </div>
                      <div class="participant-actions">
                        <!-- Choice Alter Dropdown -->
                        <select class="alter-choice-select" (change)="onAlterVote(voter.voteId, $event, currentResults.pollId)">
                          <option 
                            *ngFor="let opt of selectedPoll.options" 
                            [value]="opt.id" 
                            [selected]="opt.optionText === voter.votedOptionText"
                          >
                            {{ opt.optionText }}
                          </option>
                        </select>
                        
                        <button (click)="onDeleteVote(voter.voteId, currentResults.pollId)" class="remove-vote-btn">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Participants Pagination -->
                  <div class="participants-pagination">
                    <span class="total-label-sm">Showing {{ getMin(filteredParticipants.length) }}-{{ getMax(filteredParticipants.length) }} of {{ filteredParticipants.length }}</span>
                    <div class="pager-btns-sm">
                      <button 
                        [disabled]="participantPage === 1" 
                        (click)="onParticipantPageChange(-1)" 
                        class="glass-btn glass-btn-secondary btn-xs"
                        [class.glass-btn-disabled]="participantPage === 1"
                      >
                        Previous
                      </button>
                      <span class="page-indicator-sm">Page {{ participantPage }}</span>
                      <button 
                        [disabled]="(participantPage * participantPageSize) >= filteredParticipants.length" 
                        (click)="onParticipantPageChange(1)" 
                        class="glass-btn glass-btn-secondary btn-xs"
                        [class.glass-btn-disabled]="(participantPage * participantPageSize) >= filteredParticipants.length"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                </div>
              </div>
              <ng-template #noParticipants>
                <div class="no-participants">No matching votes found.</div>
              </ng-template>
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
    .polls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }
    .poll-item-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 220px;
    }
    .poll-header-info h4 {
      font-size: 1.1rem;
      color: #0f172a;
      margin: 12px 0 6px 0;
      line-height: 1.4;
    }
    .poll-header-info p {
      color: var(--text-secondary);
      font-size: 0.85rem;
      line-height: 1.4;
      margin: 0 0 20px 0;
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
      padding: 6px 12px;
      font-size: 0.8rem;
      border-radius: 6px;
    }
    .text-red {
      color: #991b1b;
      border-color: #fca5a5;
      background: #ffffff;
    }
    .text-red:hover {
      background: #fee2e2;
    }
    .pagination-footer {
      justify-content: space-between;
      padding-top: 16px;
      border-top: 1px solid var(--surface-border);
    }
    .total-label {
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.85rem;
    }
    .pager-btns {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .page-indicator {
      font-weight: 700;
      font-size: 0.85rem;
      color: #0f172a;
    }
    /* Modal styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .modal-card {
      width: 95%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      padding: 24px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
    }
    .modal-tabs {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 18px;
      gap: 12px;
    }
    .modal-tab-btn {
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 8px 16px;
      font-size: 0.9rem;
      font-weight: 700;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s;
    }
    .modal-tab-btn:hover {
      color: #0f172a;
    }
    .modal-tab-btn.active-tab {
      color: #0f172a;
      border-bottom-color: #0f172a;
    }
    .modal-body {
      overflow-y: auto;
      flex: 1;
      padding-right: 8px;
    }
    .participants-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .filter-wrapper {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .filter-wrapper label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #475569;
    }
    .filter-select {
      padding: 2px 6px;
      font-size: 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      background: #ffffff;
      outline: none;
      color: #0f172a;
    }
    .participant-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .alter-choice-select {
      padding: 2px 6px;
      font-size: 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      background: #ffffff;
      outline: none;
      color: #0f172a;
      cursor: pointer;
    }
    .alter-choice-select:hover {
      border-color: #94a3b8;
    }
    .modal-header {
      margin-bottom: 12px;
      padding-bottom: 0;
    }
    .modal-header h4 {
      margin: 0;
      font-size: 1.15rem;
      color: #0f172a;
    }
    .close-btn-text {
      background: transparent;
      border: 1px solid #cbd5e1;
      color: var(--text-secondary);
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }
    .close-btn-text:hover {
      background: #f8fafc;
      color: var(--text-main);
    }
    .total-votes-banner {
      background: #f8fafc;
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      padding: 10px;
      font-size: 0.85rem;
      text-align: center;
      margin-bottom: 20px;
    }
    .results-bars {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .result-row {
      margin-bottom: 6px;
    }
    .result-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .opt-text {
      color: #0f172a;
    }
    .opt-pct {
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
      background: #0f172a; /* Solid dark bar results */
      border-radius: 3px;
    }
    .modal-loading {
      text-align: center;
      font-style: italic;
      color: var(--text-secondary);
      padding: 20px;
      font-size: 0.85rem;
    }
    .participants-section {
      margin-top: 24px;
      border-top: 1px solid #f1f5f9;
      padding-top: 16px;
    }
    .participants-section h5 {
      margin: 0 0 12px 0;
      font-size: 0.95rem;
      color: #0f172a;
    }
    .participants-list {
      max-height: 400px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-right: 4px;
    }
    .participants-pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
    }
    .total-label-sm {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
    }
    .pager-btns-sm {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .page-indicator-sm {
      font-size: 0.75rem;
      font-weight: 700;
      color: #0f172a;
    }
    .btn-xs {
      padding: 4px 8px;
      font-size: 0.75rem;
      border-radius: 4px;
    }
    .participant-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: #f8fafc;
    }
    .participant-info {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      font-size: 0.8rem;
      color: #475569;
    }
    .voter-name {
      font-weight: 700;
      color: #0f172a;
    }
    .voted-for {
      color: #64748b;
    }
    .voted-time {
      color: #94a3b8;
      font-size: 0.75rem;
    }
    .remove-vote-btn {
      background: transparent;
      border: 1px solid #fca5a5;
      color: #991b1b;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .remove-vote-btn:hover {
      background: #fee2e2;
    }
    .no-participants {
      font-size: 0.8rem;
      color: #64748b;
      font-style: italic;
      text-align: center;
      padding: 12px;
    }
  `]
})
export class PollListComponent implements OnInit {
  private store = inject(Store);

  polls$ = this.store.select(selectAllPolls);
  total$ = this.store.select(selectPollTotal);
  page$ = this.store.select(selectPollPage);
  pageSize$ = this.store.select(selectPollPageSize);
  loading$ = this.store.select(selectPollLoading);
  currentResults$ = this.store.select(selectCurrentResults);

  currentPage = 1;
  currentPageSize = 10;
  
  selectedPoll: Poll | null = null;
  filterOptionText = '';
  activeModalTab: 'results' | 'participants' = 'results';

  participantPage = 1;
  participantPageSize = 10;

  ngOnInit(): void {
    this.page$.subscribe(p => this.currentPage = p);
    this.pageSize$.subscribe(ps => this.currentPageSize = ps);
    this.loadCurrentPage();
  }

  onFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filterOptionText = value;
    this.participantPage = 1; // Reset to page 1 on filter change
  }

  getFilteredParticipants(participants: Participant[] | undefined): Participant[] {
    if (!participants) {
      return [];
    }
    if (!this.filterOptionText) {
      return participants;
    }
    return participants.filter(p => p.votedOptionText.toLowerCase() === this.filterOptionText.toLowerCase());
  }

  onAlterVote(voteId: number, event: Event, pollId: number): void {
    const selectEl = event.target as HTMLSelectElement;
    const newOptionId = parseInt(selectEl.value, 10);
    if (confirm("Are you sure you want to change this participant's choice?")) {
      this.store.dispatch(VoteActions.alterVote({ id: voteId, newOptionId, pollId }));
    } else {
      // Reload results to reset dropdown to correct state
      this.store.dispatch(VoteActions.loadResults({ pollId }));
    }
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

  onEnableResults(id: number): void {
    this.store.dispatch(PollActions.enableViewResults({ id }));
  }

  onDisableResults(id: number): void {
    this.store.dispatch(PollActions.disableViewResults({ id }));
  }

  onDeletePoll(id: number): void {
    if (confirm('Are you sure you want to delete this poll and all of its votes?')) {
      this.store.dispatch(PollActions.deletePoll({ id }));
    }
  }

  onDeleteVote(id: number, pollId: number): void {
    if (confirm('Are you sure you want to remove this vote and recalculate results?')) {
      this.store.dispatch(VoteActions.deleteVote({ id, pollId }));
    }
  }

  getPaginatedParticipants(participants: Participant[] | undefined): Participant[] {
    const filtered = this.getFilteredParticipants(participants);
    const startIndex = (this.participantPage - 1) * this.participantPageSize;
    return filtered.slice(startIndex, startIndex + this.participantPageSize);
  }

  onParticipantPageChange(offset: number): void {
    this.participantPage += offset;
  }

  getMin(total: number): number {
    if (total === 0) return 0;
    return (this.participantPage - 1) * this.participantPageSize + 1;
  }

  getMax(total: number): number {
    return Math.min(this.participantPage * this.participantPageSize, total);
  }

  viewResults(poll: Poll): void {
    this.activeModalTab = 'results';
    this.filterOptionText = '';
    this.participantPage = 1;
    this.selectedPoll = poll;
    this.store.dispatch(VoteActions.loadResults({ pollId: poll.id }));
  }

  viewParticipants(poll: Poll): void {
    this.activeModalTab = 'participants';
    this.filterOptionText = '';
    this.participantPage = 1;
    this.selectedPoll = poll;
    this.store.dispatch(VoteActions.loadResults({ pollId: poll.id }));
  }

  closeResults(): void {
    this.selectedPoll = null;
  }
}
