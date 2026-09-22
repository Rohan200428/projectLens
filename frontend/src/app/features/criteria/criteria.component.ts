import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { ApiService } from "../../core/api.service";
import { Criteria } from "../../models/project.models";

@Component({
  selector: "app-criteria",
  standalone: true,
  template: `
    <div class="page-stack narrow-page">
      @if (loading) {
        <div class="loading-card">
          <div class="spinner"></div>
          <span>Loading active criteria...</span>
        </div>

      } @else if (error) {
        <div class="alert error">
          <strong>Unable to load cohort criteria</strong>
          <span>{{ error }}</span>

          <button type="button" class="secondary-button" (click)="load()">
            Retry
          </button>
        </div>

      } @else if (criteria) {
        <section class="criteria-page panel-card">
          <div class="criteria-hero">
            <span class="eyebrow">ACTIVE COHORT</span>

            <h2>{{ criteria.theme }}</h2>

            <p>
              These predefined criteria are used by ProjectLens during project
              evaluation.
            </p>
          </div>

          <div class="criteria-section">
            <span class="eyebrow">LEARNING OBJECTIVES</span>

            <p>
              {{ criteria.learningObjectives }}
            </p>
          </div>

          <div class="criteria-section">
            <span class="eyebrow">EVALUATION CRITERIA</span>

            <p>
              {{ criteria.evaluationCriteria }}
            </p>
          </div>

          <div class="threshold">
            <strong>70%</strong>

            <span> Minimum alignment score required for trainer review. </span>
          </div>
        </section>

      } @else {
        <div class="empty">No active cohort criteria found.</div>
      }
    </div>
  `,
})
export class CriteriaComponent implements OnInit {
  criteria?: Criteria;
  loading = true;
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
    this.criteria = undefined;

    this.cdr.detectChanges();

    this.api.criteria().subscribe({
      next: (response) => {
        console.log("CRITERIA RESPONSE:", response);

        this.criteria = response;
        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error("CRITERIA ERROR:", error);

        this.loading = false;
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
      return "You are not authorized to view cohort criteria.";
    }

    return error.error?.message || `Request failed with HTTP ${error.status}.`;
  }
}
