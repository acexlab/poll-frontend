import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectUser } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout-wrapper">
      <aside class="sidebar glass-panel">
        <div class="logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text gradient-text">QuickPoll</span>
          <span class="role-badge">ADMIN</span>
        </div>

        <nav class="nav-menu">
          <a routerLink="dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span class="nav-label">Dashboard</span>
          </a>
          <a routerLink="polls" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📝</span>
            <span class="nav-label">Manage Polls</span>
          </a>
          <a routerLink="create-poll" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">➕</span>
            <span class="nav-label">Create Poll</span>
          </a>
          <a routerLink="users" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👥</span>
            <span class="nav-label">Participants</span>
          </a>
        </nav>

        <div class="user-profile" *ngIf="user$ | async as user">
          <div class="profile-info">
            <div class="profile-avatar">{{ user.username.substring(0, 2).toUpperCase() }}</div>
            <div class="profile-details">
              <span class="profile-name">{{ user.username }}</span>
              <span class="profile-email">{{ user.email }}</span>
            </div>
          </div>
          <button (click)="onLogout()" class="logout-btn">
            Logout <span>🚪</span>
          </button>
        </div>
      </aside>

      <main class="main-content">
        <header class="content-header">
          <h2>Admin Management Panel</h2>
          <div class="current-time">June 9, 2026</div>
        </header>

        <section class="content-body">
          <router-outlet></router-outlet>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
    }
    .sidebar {
      width: 280px;
      position: fixed;
      top: 20px;
      bottom: 20px;
      left: 20px;
      display: flex;
      flex-direction: column;
      padding: 30px 20px;
      z-index: 10;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 40px;
    }
    .logo-icon {
      font-size: 1.5rem;
    }
    .logo-text {
      font-size: 1.35rem;
      font-weight: 800;
    }
    .role-badge {
      font-size: 0.65rem;
      font-weight: 800;
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: auto;
    }
    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 16px;
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 600;
      border-radius: 10px;
      transition: all 0.2s;
    }
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.04);
      color: var(--text-main);
    }
    .nav-item.active {
      background: rgba(59, 130, 246, 0.15);
      border-left: 3px solid var(--primary-color);
      color: #93c5fd;
    }
    .nav-icon {
      font-size: 1.15rem;
    }
    .user-profile {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 20px;
      border-top: 1px solid var(--surface-border);
    }
    .profile-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .profile-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
      color: white;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
    }
    .profile-details {
      display: flex;
      flex-direction: column;
      max-width: 180px;
    }
    .profile-name {
      font-weight: 600;
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .profile-email {
      font-size: 0.75rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .logout-btn {
      width: 100%;
      padding: 10px;
      background: rgba(244, 63, 94, 0.1);
      border: 1px solid rgba(244, 63, 94, 0.2);
      color: #fda4af;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .logout-btn:hover {
      background: rgba(244, 63, 94, 0.2);
    }
    .main-content {
      margin-left: 320px;
      flex: 1;
      padding: 40px 40px 40px 0;
    }
    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    .content-header h2 {
      font-size: 1.5rem;
      margin: 0;
    }
    .current-time {
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.95rem;
    }
    .content-body {
      min-height: calc(100vh - 150px);
    }
  `]
})
export class AdminLayoutComponent {
  private store = inject(Store);
  user$ = this.store.select(selectUser);

  onLogout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
