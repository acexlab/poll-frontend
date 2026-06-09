import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="glass-panel auth-card">
        <div class="auth-header">
          <h1 class="gradient-text">QuickPoll</h1>
          <p>Login to cast your vote or manage polls</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="auth-form">
          <div class="input-group">
            <label class="glass-label" for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              class="glass-input" 
              placeholder="Enter username" 
              [(ngModel)]="username" 
              required
              #userModel="ngModel"
            />
            <div *ngIf="userModel.invalid && userModel.touched" class="field-error">
              Username is required.
            </div>
          </div>

          <div class="input-group">
            <label class="glass-label" for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              class="glass-input" 
              placeholder="Enter password" 
              [(ngModel)]="password" 
              required
              #passModel="ngModel"
            />
            <div *ngIf="passModel.invalid && passModel.touched" class="field-error">
              Password is required.
            </div>
          </div>

          <div *ngIf="error$ | async as error" class="auth-error-box">
            {{ error }}
          </div>

          <button 
            type="submit" 
            class="glass-btn glass-btn-primary w-full"
            [disabled]="loginForm.invalid || (loading$ | async)"
            [class.glass-btn-disabled]="loginForm.invalid || (loading$ | async)"
          >
            {{ (loading$ | async) ? 'Logging in...' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/auth/register">Sign Up</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 40px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .auth-header h1 {
      font-size: 2.5rem;
      margin-bottom: 8px;
    }
    .auth-header p {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin: 0;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
    }
    .w-full {
      width: 100%;
    }
    .field-error {
      color: var(--error);
      font-size: 0.75rem;
      margin-top: 6px;
      font-weight: 500;
    }
    .auth-error-box {
      background: rgba(244, 63, 94, 0.1);
      border: 1px solid rgba(244, 63, 94, 0.2);
      color: #fda4af;
      padding: 12px;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-bottom: 20px;
      text-align: center;
    }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .auth-footer a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }
    .auth-footer a:hover {
      color: #60a5fa;
    }
  `]
})
export class LoginComponent {
  private store = inject(Store);

  username = '';
  password = '';

  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);

  onSubmit(): void {
    if (this.username.trim() && this.password.trim()) {
      this.store.dispatch(AuthActions.login({ 
        username: this.username.trim(), 
        password: this.password.trim() 
      }));
    }
  }
}
