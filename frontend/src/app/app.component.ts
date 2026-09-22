import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'plens-root',
  standalone: true,
  imports: [NgIf, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <ng-container *ngIf="auth.isLoggedIn(); else publicPage">
      <div class="app-shell">
        <aside class="sidebar">
          <a class="brand" routerLink="/dashboard">
            <span class="brand-mark">P</span>
            <span class="brand-copy">
              <strong>ProjectLens</strong>
              <small>Idea evaluator</small>
            </span>
          </a>

          <div class="workspace-card">
            <small>WORKSPACE</small>
            <strong>{{ auth.user()?.podName || 'Training Cohort' }}</strong>
            <span>{{ roleLabel() }}</span>
          </div>

          <nav class="main-nav" aria-label="Main navigation">
            <a routerLink="/dashboard" routerLinkActive="active"><span>⌂</span>Dashboard</a>
            <a routerLink="/criteria" routerLinkActive="active"><span>◈</span>Cohort criteria</a>
            <a routerLink="/submissions" routerLinkActive="active"><span>▣</span>Submissions</a>
            <a *ngIf="auth.user()?.role === 'POD_LEAD'" routerLink="/submit" routerLinkActive="active"><span>＋</span>Submit idea</a>
            <a *ngIf="auth.user()?.role === 'TRAINER'" routerLink="/reviews" routerLinkActive="active"><span>✓</span>Reviews</a>
            <a routerLink="/notifications" routerLinkActive="active"><span>◌</span>Notifications</a>
          </nav>

          <div class="sidebar-footer">
            <div class="cohort-note">
              <small>COHORT</small>
              <strong>AI-Assisted Engineering</strong>
              <span>Criteria are preconfigured</span>
            </div>
            <button class="signout" type="button" (click)="auth.logout()">Sign out</button>
          </div>
        </aside>

        <main class="main-area">
          <header class="topbar">
            <div>
              <span class="eyebrow">PROJECTLENS</span>
              <h1>{{ pageTitle() }}</h1>
            </div>
            <div class="user-area">
              <div class="avatar">{{ initials() }}</div>
              <div class="user-copy">
                <strong>{{ auth.user()?.name }}</strong>
                <span>{{ roleLabel() }}</span>
              </div>
              <button class="icon-button" type="button" title="Sign out" (click)="auth.logout()">↪</button>
            </div>
          </header>

          <section class="page-content">
            <router-outlet></router-outlet>
          </section>
        </main>
      </div>
    </ng-container>

    <ng-template #publicPage>
      <router-outlet></router-outlet>
    </ng-template>
  `
})
export class AppComponent {
  constructor(public readonly auth: AuthService, private readonly router: Router) {}

  pageTitle(): string {
    const path = this.router.url;
    if (path.includes('/reviews')) return 'Trainer reviews';
    if (path.includes('/submit')) return 'Submit project idea';
    if (path.includes('/submissions')) return 'Submissions';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/criteria')) return 'Cohort criteria';
    return 'Dashboard';
  }

  initials(): string {
    const name = this.auth.user()?.name?.trim() || 'P';
    return name.split(/\s+/).map(part => part.charAt(0)).slice(0, 2).join('').toUpperCase();
  }

  roleLabel(): string {
    switch (this.auth.user()?.role) {
      case 'TRAINER': return 'Trainer';
      case 'POD_LEAD': return 'Pod Lead';
      default: return 'Pod Member';
    }
  }
}
