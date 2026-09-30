import { Component, OnInit, HostListener, ElementRef } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { ApiService } from "../../core/api.service";
import { Criteria, SubmissionRequest } from "../../models/project.models";

@Component({
  selector: "app-submission-form",
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="form-layout">
      <section class="form-main">
        <div class="form-intro">
          <span class="eyebrow">PROJECT IDEA</span>

          <h2>
            {{ editing ? "Revise your project idea" : "Submit a project idea" }}
          </h2>

          <p class="muted">
            Complete every required field. ProjectLens evaluates the idea
            against the active predefined cohort criteria.
          </p>
        </div>

        @if (error) {
          <div class="alert error">
            {{ error }}
          </div>
        }

        @if (success) {
          <div class="alert success">
            {{ success }}
          </div>
        }

        <div class="form-card">
          <form #formRef="ngForm" (ngSubmit)="save(formRef)" novalidate>
            <div class="field">
              <label> Project title <span>*</span> </label>

              <input
                name="projectTitle"
                [(ngModel)]="form.projectTitle"
                #title="ngModel"
                required
                maxlength="50"
                placeholder="Enter the project title"
              />

              <div class="field-footer">
                @if (title.invalid && title.touched) {
                  <small class="field-error"> Project title is required. </small>
                } @else {
                  <span></span>
                }
                <small class="char-counter" [class.limit-near]="form.projectTitle.length >= 45">
                  {{ form.projectTitle.length }}/50
                </small>
              </div>
            </div>

            <div class="field">
              <label> Problem statement <span>*</span> </label>

              <textarea
                name="problemStatement"
                [(ngModel)]="form.problemStatement"
                #problem="ngModel"
                required
                maxlength="500"
                rows="6"
                placeholder="What problem are you solving, for whom, and why does it matter?"
              >
              </textarea>

              <small>
                Describe the user, current problem and expected impact.
              </small>

              <div class="field-footer">
                @if (problem.invalid && problem.touched) {
                  <small class="field-error">
                    Problem statement is required.
                  </small>
                } @else {
                  <span></span>
                }
                <small class="char-counter" [class.limit-near]="form.problemStatement.length >= 450">
                  {{ form.problemStatement.length }}/500
                </small>
              </div>
            </div>

            <div class="field">
              <label> Objectives <span>*</span> </label>

              <textarea
                name="objectives"
                [(ngModel)]="form.objectives"
                #objectives="ngModel"
                required
                maxlength="500"
                rows="5"
                placeholder="List the measurable outcomes you want to achieve."
              >
              </textarea>

              <div class="field-footer">
                @if (objectives.invalid && objectives.touched) {
                  <small class="field-error"> Objectives are required. </small>
                } @else {
                  <span></span>
                }
                <small class="char-counter" [class.limit-near]="form.objectives.length >= 450">
                  {{ form.objectives.length }}/500
                </small>
              </div>
            </div>

            <div class="field" #stackWrapper>
              <label> Technology stack <span>*</span> </label>

              <div class="stack-select" (click)="toggleStackDropdown($event)">
                @if (selectedStack.length === 0) {
                  <span class="stack-placeholder">Select technologies…</span>
                }
                @for (item of selectedStack; track item) {
                  <span class="chip">
                    {{ item }}
                    <button type="button" class="chip-remove" (click)="removeStackItem(item, $event)">×</button>
                  </span>
                }
                <span class="stack-caret" [class.open]="stackDropdownOpen">▾</span>
              </div>

              @if (stackDropdownOpen) {
                <div class="stack-dropdown" (click)="$event.stopPropagation()">
                  <input
                    class="stack-search"
                    type="text"
                    placeholder="Search or type a custom stack and press Enter"
                    [(ngModel)]="stackSearch"
                    name="stackSearch"
                    (keydown.enter)="addCustomStack($event)"
                  />
                  <div class="stack-options">
                    @for (option of filteredStackOptions(); track option) {
                      <label class="stack-option">
                        <input
                          type="checkbox"
                          [checked]="isStackSelected(option)"
                          (change)="toggleStackItem(option)"
                        />
                        {{ option }}
                      </label>
                    }
                    @if (filteredStackOptions().length === 0) {
                      <div class="stack-empty">
                        No matches. Press Enter to add "{{ stackSearch }}" as a custom entry.
                      </div>
                    }
                  </div>
                </div>
              }

              @if (selectedStack.length === 0 && stackTouched) {
                <small class="field-error">
                  Select at least one technology.
                </small>
              }
            </div>

            <div class="field">
              <label> Supporting documentation link </label>

              <input
                name="documentationLink"
                [(ngModel)]="form.documentationLink"
                placeholder="https://…"
              />

              <small>
                Optional: architecture, repository or supporting document.
              </small>
            </div>

            <div class="form-actions">
              <a class="secondary-button" routerLink="/submissions"> Cancel </a>

              <button class="primary-button" type="submit" [disabled]="saving">
                {{
                  saving
                    ? "Analysing…"
                    : editing
                      ? "Reupload for analysis"
                      : "Submit for analysis"
                }}

                →
              </button>
            </div>
          </form>
        </div>
      </section>

      <aside class="criteria-card">
        <span class="eyebrow"> ACTIVE COHORT </span>

        @if (criteria) {
          <div>
            <h3>{{ criteria.theme }}</h3>

            <p>
              {{ criteria.learningObjectives }}
            </p>

            <div class="divider"></div>

            <span class="eyebrow"> EVALUATION CRITERIA </span>

            <p>
              {{ criteria.evaluationCriteria }}
            </p>
          </div>
        } @else {
          <p class="muted">Loading active cohort criteria…</p>
        }

        <div class="threshold">
          <strong>70%</strong>
          <span> Minimum alignment score required for trainer review </span>
        </div>
      </aside>
    </div>
  `,
})
export class SubmissionFormComponent implements OnInit {
  editing = false;
  id?: number;

  saving = false;
  error = "";
  success = "";

  criteria?: Criteria;

  form: SubmissionRequest = {
    projectTitle: "",
    problemStatement: "",
    objectives: "",
    technologyStack: "",
    documentationLink: "",
  };

  readonly stackOptionList: string[] = [
    "Java", "Spring Boot", "Angular", "React", "Vue.js", "TypeScript",
    "JavaScript", "Node.js", "Express", "Python", "Django", "Flask",
    "MySQL", "PostgreSQL", "MongoDB", "Redis", "REST API", "GraphQL",
    "AI API", "TensorFlow", "PyTorch", "Docker", "Kubernetes",
    "AWS", "Azure", "GCP", "Firebase", "Kafka", ".NET", "C#", "Kotlin", "Swift",
  ];

  selectedStack: string[] = [];
  stackDropdownOpen = false;
  stackSearch = "";
  stackTouched = false;

  constructor(
    private readonly api: ApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly elementRef: ElementRef,
  ) {}

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    if (this.stackDropdownOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.stackDropdownOpen = false;
      this.stackTouched = true;
    }
  }

  toggleStackDropdown(event: Event): void {
    event.stopPropagation();
    this.stackDropdownOpen = !this.stackDropdownOpen;
    if (!this.stackDropdownOpen) {
      this.stackTouched = true;
    }
  }

  filteredStackOptions(): string[] {
    const query = this.stackSearch.trim().toLowerCase();
    if (!query) {
      return this.stackOptionList;
    }
    return this.stackOptionList.filter((option) =>
      option.toLowerCase().includes(query),
    );
  }

  isStackSelected(option: string): boolean {
    return this.selectedStack.includes(option);
  }

  toggleStackItem(option: string): void {
    if (this.isStackSelected(option)) {
      this.selectedStack = this.selectedStack.filter((item) => item !== option);
    } else {
      this.selectedStack = [...this.selectedStack, option];
    }
    this.syncStackToForm();
  }

  removeStackItem(item: string, event: Event): void {
    event.stopPropagation();
    this.selectedStack = this.selectedStack.filter((entry) => entry !== item);
    this.syncStackToForm();
  }

  addCustomStack(event: Event): void {
    event.preventDefault();
    const value = this.stackSearch.trim();
    if (value && !this.selectedStack.includes(value)) {
      this.selectedStack = [...this.selectedStack, value];
      this.syncStackToForm();
    }
    this.stackSearch = "";
  }

  private syncStackToForm(): void {
    this.form.technologyStack = this.selectedStack.join(", ");
  }

  private parseStackFromForm(value: string): void {
    this.selectedStack = value
      ? value.split(",").map((item) => item.trim()).filter(Boolean)
      : [];
  }

  ngOnInit(): void {
    this.loadCriteria();
    this.loadSubmissionForRevision();
  }

  private loadCriteria(): void {
    this.api.criteria().subscribe({
      next: (response) => {
        console.log("CRITERIA RESPONSE:", response);
        this.criteria = response;
      },

      error: (error) => {
        console.error("CRITERIA ERROR:", error);
        this.error = this.describeError(error);
      },
    });
  }

  private loadSubmissionForRevision(): void {
    const id = Number(this.route.snapshot.queryParamMap.get("revise"));

    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    this.editing = true;
    this.id = id;

    this.api.submission(id).subscribe({
      next: (submission) => {
        console.log("SUBMISSION FOR REVISION:", submission);

        this.form = {
          projectTitle: submission.projectTitle,
          problemStatement: submission.problemStatement,
          objectives: submission.objectives,
          technologyStack: submission.technologyStack,
          documentationLink: submission.documentationLink || "",
        };
        this.parseStackFromForm(submission.technologyStack);
      },

      error: (error) => {
        console.error("SUBMISSION LOAD ERROR:", error);
        this.error = this.describeError(error);
      },
    });
  }

  save(formRef: NgForm): void {
    this.success = "";
    this.error = "";

    this.stackTouched = true;

    if (formRef.invalid || this.selectedStack.length === 0) {
      formRef.form.markAllAsTouched();
      this.error = "Please complete all required fields.";
      return;
    }

    if (this.saving) {
      return;
    }

    this.saving = true;

    const request = this.normalizedRequest();

    const operation = this.editing
      ? this.api.revise(this.id!, request)
      : this.api.createSubmission(request);

    operation.subscribe({
      next: (response) => {
        console.log("SUBMISSION SAVE RESPONSE:", response);

        this.saving = false;

        this.success =
          `Submission analysed successfully. Alignment score: ` +
          `${response.evaluation?.alignmentScore ?? 0}%.`;

        this.router.navigateByUrl("/submissions");
      },

      error: (error) => {
        console.error("SUBMISSION SAVE ERROR:", error);

        this.saving = false;
        this.error = this.describeError(error);
      },
    });
  }

  private normalizedRequest(): SubmissionRequest {
    return {
      projectTitle: this.form.projectTitle.trim(),
      problemStatement: this.form.problemStatement.trim(),
      objectives: this.form.objectives.trim(),
      technologyStack: this.form.technologyStack.trim(),
      documentationLink: this.form.documentationLink.trim(),
    };
  }

  private describeError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return "Cannot reach Spring Boot on port 8081. Start the backend and keep the Angular proxy running.";
    }

    if (error.status === 401) {
      return "Your session has expired. Please sign in again.";
    }

    if (error.status === 403) {
      return "This account is not allowed to perform this action.";
    }

    if (error.status === 404) {
      return (
        error.error?.message ||
        "The requested submission or active cohort criteria was not found."
      );
    }

    return (
      error.error?.message || `Submission failed with HTTP ${error.status}.`
    );
  }
}
