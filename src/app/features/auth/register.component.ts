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
          <h1 class="auth-title">Poller</h1>
          <p>Register to start voting</p>
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="auth-form">
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
              minlength="3"
              #userModel="ngModel"
            />
            <div *ngIf="userModel.invalid && userModel.touched" class="field-error">
              Username must be at least 3 characters.
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
              placeholder="Password" 
              [(ngModel)]="password" 
              required
              minlength="6"
              #passModel="ngModel"
            />
            <div *ngIf="passModel.invalid && passModel.touched" class="field-error">
              Password must be at least 6 characters.
            </div>
          </div>

          <div class="input-group">
            <label class="glass-label" for="confirmPassword">Confirm Password</label>
            <input 
              type="text" 
              id="confirmPassword" 
              name="confirmPassword" 
              class="glass-input" 
              placeholder="Confirm Password" 
              [(ngModel)]="confirmPassword" 
              required
              #confirmPassModel="ngModel"
            />
            <div *ngIf="confirmPassModel.touched && password !== confirmPassword" class="field-error">
              Passwords do not match.
            </div>
          </div>



          <div *ngIf="error$ | async as error" class="auth-error-box">
            {{ error }}
          </div>

          <button 
            type="submit" 
            class="glass-btn glass-btn-primary w-full"
            [disabled]="registerForm.invalid || password !== confirmPassword || (loading$ | async)"
            [class.glass-btn-disabled]="registerForm.invalid || password !== confirmPassword || (loading$ | async)"
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
      margin-bottom: 24px;
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
    .role-selector {
      display: flex;
      gap: 12px;
      margin-top: 4px;
    }
    .role-btn {
      flex: 1;
      padding: 10px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      color: var(--text-secondary);
      font-weight: 600;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.15s;
    }
    .role-btn:hover {
      background: #f8fafc;
      color: var(--text-main);
    }
    .role-btn.active {
      background: #0f172a;
      border-color: #0f172a;
      color: #ffffff;
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
export class RegisterComponent {
  private store = inject(Store);

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  role = 'User';

  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);



  onSubmit(): void {
    if (this.username.trim() && this.email.trim() && this.password.trim() && this.password === this.confirmPassword) {
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
