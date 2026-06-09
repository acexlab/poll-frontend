import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as PollActions from '../../store/poll/poll.actions';
import { selectPollLoading } from '../../store/poll/poll.selectors';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-poll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="create-poll-container">
      <div class="header-section">
        <h3>Create New Poll</h3>
        <p>Set up a customized questionnaire or use a pre-built template.</p>
      </div>

      <!-- Quick Template Options -->
      <div class="glass-panel template-card">
        <div class="template-header">
          <h5>⚡ Quick Templates</h5>
          <p>Instantly deploy a pre-configured poll with standard options.</p>
        </div>
        <button 
          (click)="onCreateFifaPoll()" 
          class="glass-btn glass-btn-accent"
          [disabled]="loading$ | async"
        >
          ⚽ Create FIFA World Cup Nation Poll
        </button>
      </div>

      <!-- Custom Form -->
      <div class="glass-panel form-card">
        <h5>📝 Custom Poll Creator</h5>
        
        <form (ngSubmit)="onSubmit()" #pollForm="ngForm" class="poll-form">
          <div class="input-group">
            <label class="glass-label" for="title">Poll Title</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              class="glass-input" 
              placeholder="e.g. What is your preferred frontend framework?" 
              [(ngModel)]="title" 
              required
              #titleModel="ngModel"
            />
            <div *ngIf="titleModel.invalid && titleModel.touched" class="field-error">
              Poll title is required.
            </div>
          </div>

          <div class="input-group">
            <label class="glass-label" for="description">Description (Optional)</label>
            <textarea 
              id="description" 
              name="description" 
              class="glass-input textarea" 
              placeholder="Provide context or details about this vote..." 
              [(ngModel)]="description"
              rows="3"
            ></textarea>
          </div>

          <!-- Dynamic Options -->
          <div class="input-group">
            <div class="flex-between options-header">
              <label class="glass-label">Poll Options (Min 2)</label>
              <button 
                type="button" 
                (click)="addOption()" 
                class="add-opt-link"
                [disabled]="options.length >= 10"
              >
                + Add Option
              </button>
            </div>

            <div class="options-inputs-list">
              <div *ngFor="let opt of options; let i = index; trackBy: trackByIndex" class="option-row">
                <input 
                  type="text" 
                  [name]="'option_' + i" 
                  class="glass-input option-input" 
                  [placeholder]="'Option #' + (i + 1)" 
                  [(ngModel)]="options[i]" 
                  required
                />
                <button 
                  type="button" 
                  (click)="removeOption(i)" 
                  class="remove-opt-btn"
                  [disabled]="options.length <= 2"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            class="glass-btn glass-btn-primary submit-btn"
            [disabled]="pollForm.invalid || !isFormValid() || (loading$ | async)"
            [class.glass-btn-disabled]="pollForm.invalid || !isFormValid() || (loading$ | async)"
          >
            {{ (loading$ | async) ? 'Creating Poll...' : 'Create Poll' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .create-poll-container {
      max-width: 700px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    .header-section h3 {
      font-size: 1.8rem;
      margin-bottom: 6px;
    }
    .header-section p {
      color: var(--text-secondary);
      margin: 0;
    }
    .template-card, .form-card {
      padding: 30px;
    }
    .template-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }
    @media (max-width: 600px) {
      .template-card {
        flex-direction: column;
        align-items: flex-start;
      }
    }
    .template-header h5, .form-card h5 {
      font-size: 1.1rem;
      margin-bottom: 4px;
    }
    .template-header p {
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin: 0;
    }
    .poll-form {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .textarea {
      resize: vertical;
    }
    .options-header {
      margin-bottom: 10px;
    }
    .add-opt-link {
      background: transparent;
      border: none;
      color: var(--primary-color);
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      outline: none;
    }
    .add-opt-link:hover:not(:disabled) {
      color: #60a5fa;
    }
    .add-opt-link:disabled {
      color: var(--text-secondary);
      opacity: 0.5;
      cursor: not-allowed;
    }
    .options-inputs-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .option-row {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .option-input {
      flex: 1;
    }
    .remove-opt-btn {
      background: rgba(244, 63, 94, 0.1);
      border: 1px solid rgba(244, 63, 94, 0.2);
      color: #fda4af;
      border-radius: 8px;
      width: 44px;
      height: 44px;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      line-height: 1;
    }
    .remove-opt-btn:hover:not(:disabled) {
      background: rgba(244, 63, 94, 0.2);
    }
    .remove-opt-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .submit-btn {
      width: 100%;
      margin-top: 10px;
    }
    .field-error {
      color: var(--error);
      font-size: 0.75rem;
      margin-top: 6px;
      font-weight: 500;
    }
  `]
})
export class CreatePollComponent {
  private store = inject(Store);
  private toastr = inject(ToastrService);

  title = '';
  description = '';
  options: string[] = ['', '']; // start with 2 empty options

  loading$ = this.store.select(selectPollLoading);

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  addOption(): void {
    if (this.options.length < 10) {
      this.options.push('');
    } else {
      this.toastr.warning('A poll can have at most 10 options.', 'Limit Reached');
    }
  }

  removeOption(index: number): void {
    if (this.options.length > 2) {
      this.options.splice(index, 1);
    }
  }

  isFormValid(): boolean {
    return this.options.length >= 2 && this.options.every(opt => opt.trim().length > 0);
  }

  onSubmit(): void {
    if (this.title.trim() && this.isFormValid()) {
      this.store.dispatch(PollActions.createPoll({
        poll: {
          title: this.title.trim(),
          description: this.description.trim(),
          options: this.options.map(opt => opt.trim())
        }
      }));
    }
  }

  onCreateFifaPoll(): void {
    this.store.dispatch(PollActions.createFifaPoll());
  }
}
