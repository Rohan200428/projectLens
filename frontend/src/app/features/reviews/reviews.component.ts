import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { ApiService } from "../../core/api.service";
import { DecisionStatus, Submission } from "../../models/project.models";

@Component({
  selector: "app-reviews",
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <div class="review-layout">
      <section class="review-list panel-card">
        <div class="section-head compact">
          <div>
            <span class="eyebrow">TRAINER REVIEW</span>
            <h2>Decision queue</h2>
          </div>

          <span class="queue-count"> {{ items.length }} ready </span>
        </div>

        @if (loading) {
          <div class="loading-card small">
            <div class="spinner"></div>
            <span>Loading review queue...</span>
          </div>
        } @else if (error) {
          <div class="alert error">
            <strong>Unable to load review queue</strong>
            <span>{{ error }}</span>

            <button type="button" class="secondary-button" (click)="load()">
              Retry
            </button>
          </div>
        } @else if (!items.length) {
          <div class="empty">
            No submissions are currently awaiting trainer review.
          </div>
        } @else {
          @for (item of items; track item.id) {
            <button
              type="button"
              class="review-item"
              [class.selected]="selected?.id === item.id"
              (click)="select(item)"
            >
              <span>
                <strong>
                  {{ item.projectTitle }}
                </strong>

                <small>
                  {{ item.podName }}
                  ·
                  {{ item.submittedAt | date: "dd MMM yyyy" }}
                </small>
              </span>

              <b> {{ item.evaluation?.alignmentScore ?? 0 }}% </b>
            </button>
          }
        }
      </section>

      @if (selected) {
        <section class="detail-panel panel-card">
          <div class="detail-head">
            <div>
              <span class="status review"> Pending Review </span>

              <h2>
                {{ selected.projectTitle }}
              </h2>

              <p class="muted">
                {{ selected.podName }}
                ·
                {{ selected.podLeadName }}
              </p>
            </div>

            <div class="big-score">
              <strong> {{ selected.evaluation?.alignmentScore ?? 0 }}% </strong>

              <span> alignment </span>
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-block">
              <span>PROBLEM STATEMENT</span>

              <p>
                {{ selected.problemStatement }}
              </p>
            </div>

            <div class="detail-block">
              <span>OBJECTIVES</span>

              <p>
                {{ selected.objectives }}
              </p>
            </div>

            <div class="detail-block">
              <span>TECHNOLOGY STACK</span>

              <p>
                {{ selected.technologyStack }}
              </p>
            </div>

            <div class="detail-block">
              <span>SUBMITTED</span>

              <p>
                {{ selected.submittedAt | date: "dd MMM yyyy, h:mm a" }}
              </p>
            </div>

            <div class="detail-block">
              <span>OVERLAP</span>

              <p>
                <span
                  class="badge"
                  [class.danger]="selected.evaluation?.overlapFlag"
                >
                  {{ selected.evaluation?.overlapLevel || "NONE" }}
                </span>

                {{
                  selected.evaluation?.overlapFlag
                    ? "Similar idea detected."
                    : "No significant overlap detected."
                }}
              </p>
            </div>

            <div class="detail-block">
              <span>DOCUMENTATION</span>

              <p>
                @if (selected.documentationLink) {
                  <a
                    [href]="selected.documentationLink"
                    target="_blank"
                    rel="noopener"
                  >
                    Open supporting document →
                  </a>
                } @else {
                  <span>—</span>
                }
              </p>
            </div>

            <div class="detail-block full-span">
              <span>ANALYSIS SUMMARY</span>

              <p>
                {{ selected.evaluation?.analysisSummary || "—" }}
              </p>
            </div>

            <div class="detail-block">
              <span>MATCHED CRITERIA</span>

              <p>
                {{ selected.evaluation?.matchedCriteria || "—" }}
              </p>
            </div>

            <div class="detail-block">
              <span>MISSING CRITERIA</span>

              <p>
                {{ selected.evaluation?.missingCriteria || "None" }}
              </p>
            </div>
          </div>

          <div class="decision-box">
            <span class="eyebrow"> FINAL DECISION </span>

            <h3>Trainer decision</h3>

            <textarea
              [(ngModel)]="comments"
              rows="4"
              placeholder="Add comments for the pod..."
            >
            </textarea>

            <div class="decision-actions">
              <button
                type="button"
                class="decision approve"
                [disabled]="saving"
                (click)="decide('APPROVED')"
              >
                Approve
              </button>

              <button
                type="button"
                class="decision revise"
                [disabled]="saving"
                (click)="decide('NEEDS_REVISION')"
              >
                Needs Revision
              </button>

              <button
                type="button"
                class="decision reject"
                [disabled]="saving"
                (click)="decide('REJECTED')"
              >
                Reject
              </button>
            </div>
          </div>
        </section>
      } @else if (!loading && !error) {
        <section class="choose panel-card">
          <div class="choose-icon">✓</div>

          <h3>Select a project to review</h3>

          <p>
            Select a submission from the queue to view its complete AI
            evaluation.
          </p>
        </section>
      }
    </div>
  `,
})
export class ReviewsComponent implements OnInit {
  items: Submission[] = [];
  selected?: Submission;

  comments = "";

  loading = true;
  saving = false;
  error = "";

  constructor(
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = "";
    this.items = [];
    this.selected = undefined;
    this.comments = "";

    this.cdr.detectChanges();

    this.api.submissions().subscribe({
      next: (response) => {
        console.log("REVIEWS RESPONSE:", response);

        this.items = response ?? [];

        if (this.items.length > 0) {
          this.selected = this.items[0];
          this.comments = this.selected.decision?.comments ?? "";
        }

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error("REVIEWS ERROR:", error);

        this.loading = false;
        this.error = this.describeError(error);

        this.cdr.detectChanges();
      },
    });
  }

  select(submission: Submission): void {
    this.selected = submission;
    this.comments = submission.decision?.comments ?? "";

    this.error = "";

    this.cdr.detectChanges();
  }

  decide(status: DecisionStatus): void {
    if (!this.selected || this.saving) {
      return;
    }

    this.saving = true;
    this.error = "";

    this.cdr.detectChanges();

    this.api
      .decide(this.selected.id, {
        status,
        comments: this.comments.trim(),
      })
      .subscribe({
        next: (response) => {
          console.log("DECISION RESPONSE:", response);

          this.saving = false;

          this.items = this.items.filter((item) => item.id !== response.id);

          this.selected = undefined;
          this.comments = "";

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error("DECISION ERROR:", error);

          this.saving = false;
          this.error = this.describeError(error);

          this.cdr.detectChanges();
        },
      });
  }

  private describeError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return "Cannot reach the backend on port 8081.";
    }

    if (error.status === 401) {
      return "Your session has expired. Please log in again.";
    }

    if (error.status === 403) {
      return "Only a Trainer can perform this action.";
    }

    return error.error?.message || `Request failed with HTTP ${error.status}.`;
  }
}
