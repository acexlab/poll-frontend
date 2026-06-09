import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="glass-panel auth-card">
        <div class="auth-header">
          <h1 class="gradient-text">Create Account</h1>
          <p>Register as a voter or administrator</p>
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="auth-form">
          <div class="input-group">
            <label class="glass-label" for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              class="glass-input" 
              placeholder="Username (min 3 chars)" 
              [(ngModel)]="username" 
              required
              minlength="3"
              #userModel="ngModel"
            />
            <div *ngIf="userModel.invalid && userModel.touched" class="field-error">
              Username is required and must be at least 3 characters.
            </div>
          </div>

          <div class="input-group">
            <label class="glass-label" for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="glass-input" 
              placeholder="Email address" 
              [(ngModel)]="email" 
              required
              email
              #emailModel="ngModel"
            />
            <div *ngIf="emailModel.invalid && emailModel.touched" class="field-error">
              A valid email address is required.
            </div>
          </div>

          <div class="input-group">
            <label class="glass-label" for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              class="glass-input" 
              placeholder="Password (min 6 chars)" 
              [(ngModel)]="password" 
              required
              minlength="6"
              #passModel="ngModel"
            />
            <div *ngIf="passModel.invalid && passModel.touched" class="field-error">
              Password is required and must be at least 6 characters.
            </div>
          </div>

          <div class="input-group">
            <label class="glass-label">Account Role</label>
            <div class="role-selector">
              <button 
                type="button" 
                class="role-btn" 
                [class.active]="role === 'User'" 
                (click)="setRole('User')"
              >
                User (Voter)
              </button>
              <button 
                type="button" 
                class="role-btn" 
                [class.active]="role === 'Admin'" 
                (click)="setRole('Admin')"
              >
                Admin
              </button>
            </div>
          </div>

          <div *ngIf="error$ | async as error" class="auth-error-box">
            {{ error }}
          </div>

          <button 
            type="submit" 
            class="glass-btn glass-btn-accent w-full"
            [disabled]="registerForm.invalid || (loading$ | async)"
            [class.glass-btn-disabled]="registerForm.invalid || (loading$ | async)"
          >
            {{ (loading$ | async) ? 'Registering...' : 'Register' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/auth/login">Sign In</a></p>
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
      font-size: 2.2rem;
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
    .role-selector {
      display: flex;
      gap: 12px;
      margin-top: 4px;
    }
    .role-btn {
      flex: 1;
      padding: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      color: var(--text-secondary);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .role-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-main);
    }
    .role-btn.active {
      background: rgba(168, 85, 247, 0.15);
      border-color: var(--accent-color);
      color: #e9d5ff;
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
      color: var(--accent-color);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }
    .auth-footer a:hover {
      color: #c084fc;
    }
  `]
})
export class RegisterComponent {
  private store = inject(Store);

  username = '';
  email = '';
  password = '';
  role = 'User';

  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);

  setRole(selectedRole: string): void {
    this.role = selectedRole;
  }

  onSubmit(): void {
    if (this.username.trim() && this.email.trim() && this.password.trim()) {
      this.store.dispatch(AuthActions.register({
        user: {
          username: this.username.trim(),
          email: this.email.trim(),
          password: this.password.trim(),
          role: this.role
        }
      }));
    }
  }
}
