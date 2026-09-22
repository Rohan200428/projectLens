import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ApiService } from "../../core/api.service";
import { AuthService } from "../../core/auth.service";
import {
  TrainerDashboard,
  PodLeadDashboard,
} from "../../models/project.models";

@Component({
  selector: "app-dashboard",
  standalone: true,
  template: `
    <section class="dashboard-page">
      <div class="page-header">
        <div>
          <p class="eyebrow">PROJECTLENS</p>
          <h1>Dashboard</h1>
          <p>Track your project submissions and evaluation status.</p>
        </div>

        <div class="user-info">
          <strong>{{ auth.user()?.name }}</strong>
          <span>{{ auth.user()?.role }}</span>
        </div>
      </div>

      @if (loading) {
        <div class="state">
          <h2>Loading your dashboard...</h2>
          <p>Fetching the latest dashboard data.</p>
        </div>
      } @else if (error) {
        <div class="state error-state">
          <h2>Unable to load dashboard</h2>
          <p>{{ error }}</p>
          <button type="button" (click)="load()">Retry</button>
        </div>
      } @else if (trainer) {
        <div class="stats-grid">
          <div class="stat-card">
            <span>Total Submissions</span>
            <strong>{{ trainer.totalSubmissions }}</strong>
          </div>

          <div class="stat-card">
            <span>Awaiting Review</span>
            <strong>{{ trainer.awaitingReview }}</strong>
          </div>

          <div class="stat-card">
            <span>Needs Revision</span>
            <strong>{{ trainer.needsRevision }}</strong>
          </div>

          <div class="stat-card">
            <span>Average Alignment</span>
            <strong>{{ trainer.averageAlignment }}%</strong>
          </div>

          <div class="stat-card">
            <span>Overlap Flags</span>
            <strong>{{ trainer.overlapFlags }}</strong>
          </div>
        </div>

        <section class="content-card">
          <h2>Review Queue</h2>

          @if (trainer.reviewQueue.length === 0) {
            <p>No submissions awaiting review.</p>
          }

          @for (submission of trainer.reviewQueue; track submission.id) {
            <article class="submission-row">
              <div>
                <strong>{{ submission.projectTitle }}</strong>
                <p>{{ submission.podName }} · {{ submission.podLeadName }}</p>
              </div>

              <div>
                <span>{{ submission.status }}</span>
              </div>
            </article>
          }
        </section>
      } @else if (podLead) {
        <div class="stats-grid">
          <div class="stat-card">
            <span>My Submissions</span>
            <strong>{{ podLead.mySubmissions }}</strong>
          </div>

          <div class="stat-card">
            <span>Needs Revision</span>
            <strong>{{ podLead.needsRevision }}</strong>
          </div>

          <div class="stat-card">
            <span>Pending Review</span>
            <strong>{{ podLead.pendingReview }}</strong>
          </div>

          <div class="stat-card">
            <span>Reviewed</span>
            <strong>{{ podLead.reviewed }}</strong>
          </div>

          <div class="stat-card">
            <span>Latest Score</span>
            <strong>{{ podLead.latestScore }}%</strong>
          </div>
        </div>

        <section class="content-card">
          <h2>Recent Submissions</h2>

          @if (podLead.recentSubmissions.length === 0) {
            <p>No submissions found.</p>
          }

          @for (submission of podLead.recentSubmissions; track submission.id) {
            <article class="submission-row">
              <div>
                <strong>{{ submission.projectTitle }}</strong>
                <p>{{ submission.podName }} · {{ submission.status }}</p>
              </div>

              <div>
                @if (submission.evaluation) {
                  <strong>{{ submission.evaluation.alignmentScore }}%</strong>
                }
              </div>
            </article>
          }
        </section>
      } @else {
        <div class="state">
          <h2>No dashboard data</h2>
          <p>
            The dashboard response was received, but no dashboard state was
            assigned.
          </p>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .dashboard-page {
        padding: 32px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
        margin-bottom: 32px;
      }

      .eyebrow {
        margin: 0 0 6px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1.5px;
      }

      h1 {
        margin: 0;
        font-size: 32px;
      }

      .page-header p {
        margin-top: 8px;
      }

      .user-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 18px;
        margin-bottom: 28px;
      }

      .stat-card {
        padding: 24px;
        border: 1px solid #ddd;
        border-radius: 12px;
        background: white;
      }

      .stat-card span {
        display: block;
        margin-bottom: 12px;
        font-size: 14px;
      }

      .stat-card strong {
        font-size: 28px;
      }

      .content-card {
        padding: 24px;
        border: 1px solid #ddd;
        border-radius: 12px;
        background: white;
      }

      .content-card h2 {
        margin-top: 0;
      }

      .submission-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        padding: 18px 0;
        border-bottom: 1px solid #eee;
      }

      .submission-row:last-child {
        border-bottom: 0;
      }

      .submission-row p {
        margin: 6px 0 0;
      }

      .state {
        padding: 48px;
        text-align: center;
        border: 1px solid #ddd;
        border-radius: 12px;
        background: white;
      }

      .error-state {
        border: 1px solid #d88;
      }

      button {
        padding: 10px 18px;
        border: 0;
        border-radius: 6px;
        cursor: pointer;
      }

      @media (max-width: 900px) {
        .stats-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .page-header {
          align-items: flex-start;
          flex-direction: column;
        }

        .user-info {
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  trainer?: TrainerDashboard;
  podLead?: PodLeadDashboard;

  loading = true;
  error = "";

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = "";
    this.trainer = undefined;
    this.podLead = undefined;

    const role = this.auth.user()?.role;

    if (role === "TRAINER") {
      this.api.trainerDashboard().subscribe({
        next: (response) => {
          console.log("TRAINER DASHBOARD RESPONSE:", response);
          this.trainer = response;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("TRAINER DASHBOARD ERROR:", error);
          this.error = this.getErrorMessage(error);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });

      return;
    }

    this.api.podLeadDashboard().subscribe({
      next: (response) => {
        console.log("POD LEAD DASHBOARD RESPONSE:", response);
        this.podLead = response;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("POD LEAD DASHBOARD ERROR:", error);
        this.error = this.getErrorMessage(error);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.status) {
      return `Request failed with HTTP ${error.status}.`;
    }

    return "Unable to load dashboard data.";
  }
}
