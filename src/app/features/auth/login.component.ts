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
          <h1 class="auth-title">Poller</h1>
          <p>Sign in to cast votes or manage polls</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="auth-form">
          <div class="input-group">
            <label class="glass-label" for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              class="glass-input" 
              placeholder="Username" 
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
              placeholder="Password" 
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
            {{ (loading$ | async) ? 'Signing in...' : 'Sign In' }}
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
      background: #f1f5f9;
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 36px 30px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 28px;
    }
    .auth-title {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin: 0 0 6px 0;
      color: #0f172a;
    }
    .auth-header p {
      color: var(--text-secondary);
      font-size: 0.9rem;
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
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: var(--error);
      padding: 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      margin-bottom: 16px;
      text-align: center;
      font-weight: 500;
    }
    .auth-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .auth-footer a {
      color: #0f172a;
      text-decoration: underline;
      font-weight: 600;
    }
    .auth-footer a:hover {
      color: #3b82f6;
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
