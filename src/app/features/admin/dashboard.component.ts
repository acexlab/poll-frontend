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
          <div class="stat-content">
            <span class="stat-label">Total Participants</span>
            <h3 class="stat-value">{{ stats.totalUsers }}</h3>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-content">
            <span class="stat-label">Total Polls</span>
            <h3 class="stat-value">{{ stats.totalPolls }}</h3>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-content">
            <span class="stat-label">Total Votes Cast</span>
            <h3 class="stat-value">{{ stats.totalVotes }}</h3>
          </div>
        </div>

        <div class="glass-panel stat-card">
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
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }
    .stat-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 24px;
    }
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    .stat-label {
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: #0f172a;
      margin: 6px 0 0 0;
    }
    .charts-section {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }
    .chart-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 24px;
    }
    .chart-card h4 {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 20px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 12px;
    }
    .chart-container {
      position: relative;
      height: 260px;
      display: flex;
      justify-content: center;
      align-items: center;
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
          backgroundColor: ['#0f172a', '#cbd5e1'], // clean black and gray theme
          borderColor: ['#ffffff', '#ffffff'],
          borderWidth: 2
        }]
      } as any, // Cast to any to handle type compatibility cleanly
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#475569',
              font: {
                family: 'Plus Jakarta Sans',
                weight: 'bold',
                size: 12
              }
            }
          }
        }
      }
    });
  }
}
