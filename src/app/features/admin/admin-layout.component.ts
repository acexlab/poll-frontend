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
      <header class="top-nav glass-panel">
        <div class="nav-container">
          <div class="logo">
            <span class="logo-text">Poller</span>
            <span class="role-badge">Admin</span>
          </div>

          <nav class="nav-menu">
            <a routerLink="dashboard" routerLinkActive="active" class="nav-item">Dashboard</a>
            <a routerLink="polls" routerLinkActive="active" class="nav-item">Manage Polls</a>
            <a routerLink="create-poll" routerLinkActive="active" class="nav-item">Create Poll</a>
          </nav>

          <div class="user-profile" *ngIf="user$ | async as user">
            <span class="profile-name">{{ user.username }}</span>
            <button (click)="onLogout()" class="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main class="main-content">
        <section class="content-body">
          <router-outlet></router-outlet>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f8fafc;
    }
    .top-nav {
      height: 64px;
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      background: #ffffff !important;
      border-bottom: 1px solid var(--surface-border) !important;
      border-radius: 0 !important;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
      z-index: 100;
    }
    .nav-container {
      max-width: 1200px;
      height: 100%;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-text {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #0f172a;
    }
    .role-badge {
      font-size: 0.65rem;
      font-weight: 700;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .nav-menu {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .nav-item {
      padding: 8px 16px;
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      border-radius: 6px;
      transition: all 0.15s;
    }
    .nav-item:hover {
      background: #f1f5f9;
      color: var(--text-main);
    }
    .nav-item.active {
      background: #0f172a;
      color: #ffffff;
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .profile-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--text-main);
    }
    .logout-btn {
      padding: 6px 12px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #991b1b;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .logout-btn:hover {
      background: #fee2e2;
      border-color: #fecaca;
    }
    .main-content {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 40px 24px;
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
