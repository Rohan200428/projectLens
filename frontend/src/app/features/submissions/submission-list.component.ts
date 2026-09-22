import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ApiService } from "../../core/api.service";
import { AuthService } from "../../core/auth.service";
import { Submission } from "../../models/project.models";

@Component({
  selector: "app-submission-list",
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="submissions-page">
      <div class="page-header">
        <div>
          <p class="eyebrow">PROJECTLENS</p>
          <h1>Submissions</h1>
          <p>View your project submissions and evaluation status.</p>
        </div>

        @if (auth.user()?.role === "POD_LEAD") {
          <a routerLink="/submit" class="submit-button"> New Submission </a>
        }
      </div>

      @if (loading) {
        <div class="state">
          <h2>Loading submissions...</h2>
          <p>Fetching your latest submissions.</p>
        </div>
      } @else if (error) {
        <div class="state error-state">
          <h2>Unable to load submissions</h2>
          <p>{{ error }}</p>
          <button type="button" (click)="load()">Retry</button>
        </div>
      } @else if (items.length === 0) {
        <div class="state">
          <h2>No submissions found</h2>
          <p>You don't have any submissions yet.</p>

          @if (auth.user()?.role === "POD_LEAD") {
            <a routerLink="/submit" class="submit-button">
              Create Submission
            </a>
          }
        </div>
      } @else {
        <div class="submission-grid">
          @for (submission of items; track submission.id) {
            <article class="submission-card">
              <div class="card-header">
                <div>
                  <h2>{{ submission.projectTitle }}</h2>
                  <p>{{ submission.podName }}</p>
                </div>

                <span class="status">
                  {{ submission.status }}
                </span>
              </div>

              <div class="details">
                <div class="detail">
                  <strong>Problem Statement</strong>
                  <p>{{ submission.problemStatement }}</p>
                </div>

                <div class="detail">
                  <strong>Objectives</strong>
                  <p>{{ submission.objectives }}</p>
                </div>

                <div class="detail">
                  <strong>Technology Stack</strong>
                  <p>{{ submission.technologyStack }}</p>
                </div>
              </div>

              @if (submission.evaluation) {
                <div class="evaluation">
                  <h3>AI Evaluation</h3>

                  <div class="score">
                    <span>Alignment Score</span>
                    <strong>
                      {{ submission.evaluation.alignmentScore }}%
                    </strong>
                  </div>

                  <div class="evaluation-detail">
                    <strong>Analysis</strong>
                    <p>{{ submission.evaluation.analysisSummary }}</p>
                  </div>

                  <div class="evaluation-detail">
                    <strong>Matched Criteria</strong>
                    <p>{{ submission.evaluation.matchedCriteria }}</p>
                  </div>

                  <div class="evaluation-detail">
                    <strong>Missing Criteria</strong>
                    <p>{{ submission.evaluation.missingCriteria }}</p>
                  </div>

                  @if (submission.evaluation.overlapFlag) {
                    <div class="overlap-warning">
                      Overlap detected:
                      {{ submission.evaluation.overlapLevel }}
                    </div>
                  }
                </div>
              }

              @if (submission.decision) {
                <div class="decision">
                  <h3>Trainer Decision</h3>

                  <p>
                    <strong>Status:</strong>
                    {{ submission.decision.status }}
                  </p>

                  @if (submission.decision.comments) {
                    <p>
                      <strong>Comments:</strong>
                      {{ submission.decision.comments }}
                    </p>
                  }
                </div>
              }

              <div class="card-footer">
                <span> Submitted: {{ submission.submittedAt }} </span>

                @if (submission.status === "NEEDS_REVISION") {
                  @if (auth.user()?.role === "POD_LEAD") {
                    <a
                      [routerLink]="['/submit']"
                      [queryParams]="{ revise: submission.id }"
                      class="revise-button"
                    >
                      Revise
                    </a>
                  }
                }
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      .submissions-page {
        max-width: 1400px;
        margin: 0 auto;
        padding: 32px;
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

      .submit-button,
      .revise-button {
        display: inline-block;
        padding: 10px 18px;
        border-radius: 6px;
        text-decoration: none;
        cursor: pointer;
      }

      .submission-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 24px;
      }

      .submission-card {
        padding: 24px;
        border: 1px solid #ddd;
        border-radius: 12px;
        background: white;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        margin-bottom: 24px;
      }

      .card-header h2 {
        margin: 0;
        font-size: 20px;
      }

      .card-header p {
        margin: 6px 0 0;
      }

      .status {
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
      }

      .details {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .detail strong,
      .evaluation-detail strong {
        display: block;
        margin-bottom: 5px;
      }

      .detail p,
      .evaluation-detail p {
        margin: 0;
        line-height: 1.5;
      }

      .evaluation {
        margin-top: 24px;
        padding: 18px;
        border-radius: 10px;
        border: 1px solid #ddd;
      }

      .evaluation h3,
      .decision h3 {
        margin-top: 0;
      }

      .score {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
        padding-bottom: 14px;
        border-bottom: 1px solid #eee;
      }

      .score strong {
        font-size: 26px;
      }

      .evaluation-detail {
        margin-top: 14px;
      }

      .overlap-warning {
        margin-top: 16px;
        padding: 10px;
        border-radius: 6px;
        border: 1px solid #ddd;
      }

      .decision {
        margin-top: 24px;
        padding: 18px;
        border-radius: 10px;
        border: 1px solid #ddd;
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #eee;
        font-size: 13px;
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
        .submission-grid {
          grid-template-columns: 1fr;
        }

        .page-header {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    `,
  ],
})
export class SubmissionListComponent implements OnInit {
  items: Submission[] = [];
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
    this.items = [];

    this.api.submissions().subscribe({
      next: (response) => {
        console.log("SUBMISSIONS RESPONSE:", response);

        this.items = response ?? [];
        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error("SUBMISSIONS ERROR:", error);

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

    return "Unable to load submissions.";
  }
}
