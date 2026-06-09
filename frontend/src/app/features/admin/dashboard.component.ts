import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollService } from '../../core/services/poll.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="stats-grid" *ngIf="stats">
        <div class="glass-panel stat-card">
          <div class="stat-icon bg-blue">👥</div>
          <div class="stat-content">
            <span class="stat-label">Total Participants</span>
            <h3 class="stat-value">{{ stats.totalUsers }}</h3>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-icon bg-purple">📝</div>
          <div class="stat-content">
            <span class="stat-label">Total Polls</span>
            <h3 class="stat-value">{{ stats.totalPolls }}</h3>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-icon bg-green">🗳️</div>
          <div class="stat-content">
            <span class="stat-label">Total Votes Cast</span>
            <h3 class="stat-value">{{ stats.totalVotes }}</h3>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-icon bg-orange">⚡</div>
          <div class="stat-content">
            <span class="stat-label">Active Polls</span>
            <h3 class="stat-value">{{ stats.activePolls }}</h3>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div class="glass-panel chart-card">
          <h4>Poll Distribution</h4>
          <div class="chart-container">
            <canvas #chartCanvas></canvas>
          </div>
        </div>

        <div class="glass-panel info-card">
          <h4>System Information</h4>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">Environment:</span>
              <span class="info-val badge badge-active">Development</span>
            </div>
            <div class="info-item">
              <span class="info-label">Database Provider:</span>
              <span class="info-val badge badge-active">SQLite (Local)</span>
            </div>
            <div class="info-item">
              <span class="info-label">Framework:</span>
              <span class="info-val">Angular 22.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">Backend API:</span>
              <span class="info-val">.NET 8.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px;
    }
    .stat-icon {
      width: 54px;
      height: 54px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .bg-blue { background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); }
    .bg-purple { background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); }
    .bg-green { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); }
    .bg-orange { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); }
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    .stat-label {
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stat-value {
      font-size: 1.8rem;
      font-weight: 800;
      margin: 4px 0 0 0;
    }
    .charts-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
    }
    @media (max-width: 900px) {
      .charts-section {
        grid-template-columns: 1fr;
      }
    }
    .chart-card, .info-card {
      padding: 30px;
    }
    .chart-card h4, .info-card h4 {
      font-size: 1.15rem;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--surface-border);
      padding-bottom: 12px;
    }
    .chart-container {
      position: relative;
      height: 280px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .info-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }
    .info-label {
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .info-val {
      font-weight: 700;
      font-size: 0.9rem;
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private pollService = inject(PollService);
  
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;
  stats: any = null;

  ngOnInit(): void {
    this.pollService.getAnalytics().subscribe(data => {
      this.stats = data;
      this.renderChart();
    });
  }

  ngAfterViewInit(): void {
    if (this.stats) {
      this.renderChart();
    }
  }

  renderChart(): void {
    if (!this.chartCanvas || !this.stats) return;

    // Destroy existing chart to prevent rendering bugs
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Active Polls', 'Inactive Polls'],
        datasets: [{
          data: [this.stats.activePolls, this.stats.inactivePolls],
          backgroundColor: ['#3b82f6', '#f43f5e'],
          borderColor: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.1)'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              font: {
                family: 'Plus Jakarta Sans',
                weight: 'bold'
              }
            }
          }
        }
      }
    });
  }
}
