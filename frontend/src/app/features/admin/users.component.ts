import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollService } from '../../core/services/poll.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="users-container">
      <div class="header-section">
        <h3>System Participants</h3>
        <p>A list of all registered voters and administrators in the system.</p>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner-ring"></div>
        <p>Loading participants...</p>
      </div>

      <!-- Users Grid -->
      <div class="table-container glass-panel" *ngIf="!loading">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>#{{ user.id }}</td>
              <td class="bold-text">{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-tag" [class.admin-tag]="user.role === 'Admin'">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <span class="badge" [class.badge-active]="user.isActive" [class.badge-inactive]="!user.isActive">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ user.createdAt | date:'mediumDate' }}</td>
            </tr>
            <tr *ngIf="users.length === 0">
              <td colspan="6" class="empty-table-row">No participants found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="flex-row-center pagination-footer" *ngIf="!loading">
        <span class="total-label">Total: {{ totalRecords }} participants</span>
        <div class="pager-btns">
          <button 
            [disabled]="currentPage === 1" 
            (click)="onPageChange(-1)" 
            class="glass-btn glass-btn-secondary btn-sm"
          >
            ◀ Prev
          </button>
          <span class="page-indicator">Page {{ currentPage }}</span>
          <button 
            [disabled]="(currentPage * currentPageSize) >= totalRecords" 
            (click)="onPageChange(1)" 
            class="glass-btn glass-btn-secondary btn-sm"
          >
            Next ▶
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .users-container {
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
    .table-container {
      width: 100%;
      overflow-x: auto;
      border-radius: 12px;
    }
    .users-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .users-table th {
      background: rgba(255, 255, 255, 0.02);
      color: var(--text-secondary);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.8rem;
      padding: 18px 24px;
      border-bottom: 2px solid var(--surface-border);
      letter-spacing: 0.05em;
    }
    .users-table td {
      padding: 16px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 0.9rem;
    }
    .users-table tr:hover td {
      background: rgba(255, 255, 255, 0.01);
    }
    .bold-text {
      font-weight: 600;
      color: var(--text-main);
    }
    .role-tag {
      font-size: 0.75rem;
      font-weight: 700;
      background: rgba(59, 130, 246, 0.15);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.3);
      padding: 3px 8px;
      border-radius: 6px;
    }
    .role-tag.admin-tag {
      background: rgba(239, 68, 68, 0.15);
      color: #fca5a5;
      border-color: rgba(239, 68, 68, 0.3);
    }
    .empty-table-row {
      text-align: center;
      font-style: italic;
      color: var(--text-secondary);
      padding: 30px !important;
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
    .btn-sm {
      padding: 8px 14px;
      font-size: 0.8rem;
      border-radius: 8px;
    }
  `]
})
export class UsersComponent implements OnInit {
  private pollService = inject(PollService);

  users: User[] = [];
  totalRecords = 0;
  currentPage = 1;
  currentPageSize = 10;
  loading = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.pollService.getUsers(this.currentPage, this.currentPageSize).subscribe({
      next: (res) => {
        this.users = res.data;
        this.totalRecords = res.totalRecords;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onPageChange(offset: number): void {
    this.currentPage += offset;
    this.loadUsers();
  }
}
