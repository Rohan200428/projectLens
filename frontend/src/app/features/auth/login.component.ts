import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <div class="login-page">
      <section class="login-hero">
        <div class="hero-brand"><span class="brand-mark">P</span><div><strong>ProjectLens</strong><small>AI-assisted project evaluation</small></div></div>
        <div class="hero-content">
          <span class="pill">SMART IDEA REVIEW</span>
          <h1>Turn project ideas into <em>clear decisions.</em></h1>
          <p>One reliable workspace for submissions, alignment analysis, overlap detection and trainer decisions.</p>
        </div>
        <div class="signal-card">
          <small>MINIMUM ALIGNMENT</small>
          <strong>70%</strong>
          <span>Qualified ideas move to trainer review.</span>
        </div>
      </section>

      <section class="login-panel">
        <div class="login-card">
          <span class="eyebrow">WELCOME BACK</span>
          <h2>Sign in to ProjectLens</h2>
          <p class="muted">Use your assigned account to access your workspace.</p>

          <form #loginForm="ngForm" (ngSubmit)="submit()" novalidate>
            <label>Email
              <input type="email" name="email" [(ngModel)]="email" required email autocomplete="username" placeholder="you@projectlens.local">
            </label>
            <label>Password
              <div class="password-field">
                <input [type]="showPassword ? 'text' : 'password'" name="password" [(ngModel)]="password" required autocomplete="current-password" placeholder="Enter your password">
                <button type="button" (click)="showPassword = !showPassword">{{ showPassword ? 'Hide' : 'Show' }}</button>
              </div>
            </label>

            <div class="alert error" *ngIf="error">{{ error }}</div>
            <button class="primary-button full-width" type="submit" [disabled]="loading || loginForm.invalid">
              {{ loading ? 'Signing in…' : 'Sign in' }}
            </button>
          </form>

          <div class="demo-accounts">
            <strong>Demo accounts</strong>
            <span>Trainer · trainer@projectlens.local</span>
            <span>Pod Lead · alpha@projectlens.local</span>
            <span>Pod Member · alpha.member@projectlens.local</span>
          </div>
        </div>
      </section>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (!this.email.trim() || !this.password) {
      this.error = 'Enter your email and password.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.login(this.email.trim(), this.password).subscribe({
      next: response => {
        this.loading = false;
        this.router.navigateByUrl('/dashboard');
      },
      error: error => {
        this.loading = false;
        this.error = this.apiError(error, 'Unable to sign in. Check your credentials.');
      }
    });
  }

  private apiError(error: any, fallback: string): string {
    return error?.error?.message || error?.error?.error || fallback;
  }
}
