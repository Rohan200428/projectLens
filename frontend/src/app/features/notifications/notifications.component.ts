import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { ApiService } from "../../core/api.service";
import { NotificationItem } from "../../models/project.models";

@Component({
  standalone: true,
  imports: [DatePipe],
  template: `
    <section class="page-header">
      <div>
        <h1>Notifications</h1>
        <p>Updates about your ProjectLens activities.</p>
      </div>
      <button class="secondary" type="button" (click)="load()">Refresh</button>
    </section>

    @if (loading) {
      <section class="card state">Loading notifications...</section>
    }

    @if (!loading && error) {
      <section class="card error">
        {{ error }}
      </section>
    }

    @if (!loading && !error && items.length === 0) {
      <section class="card state">No notifications found.</section>
    }

    @if (!loading && !error && items.length > 0) {
      <section class="notification-list">
        @for (item of items; track item.id) {
          <article class="card notification" [class.unread]="!item.read">
            <div class="notification-content">
              <div class="notification-message">
                {{ item.message }}
              </div>

              <div class="notification-date">
                {{ item.createdAt | date: "medium" }}
              </div>
            </div>

            @if (!item.read) {
              <button class="secondary" type="button" (click)="read(item.id)">
                Mark as read
              </button>
            } @else {
              <span class="read-label">Read</span>
            }
          </article>
        }
      </section>
    }
  `,
})
export class NotificationsComponent implements OnInit {
  items: NotificationItem[] = [];
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

    this.api.notifications().subscribe({
      next: (response) => {
        console.log("Notifications response:", response);

        this.items = response ?? [];
        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Notifications error:", error);

        this.loading = false;
        this.error = this.describeError(error);

        this.cdr.detectChanges();
      },
    });
  }

  read(id: number): void {
    this.api.markRead(id).subscribe({
      next: () => {
        this.items = this.items.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        );

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = this.describeError(error);
        this.cdr.detectChanges();
      },
    });
  }

  private describeError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return "Cannot reach Spring Boot on port 8081. Start the backend and keep the Angular proxy running.";
    }

    if (error.status === 401) {
      return "Your session has expired. Please sign in again.";
    }

    if (error.status === 403) {
      return "You are not allowed to access notifications.";
    }

    return error.error?.message || `Request failed with HTTP ${error.status}.`;
  }
}
