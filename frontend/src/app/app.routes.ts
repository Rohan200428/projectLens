import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { SubmissionFormComponent } from './features/submissions/submission-form.component';
import { SubmissionListComponent } from './features/submissions/submission-list.component';
import { ReviewsComponent } from './features/reviews/reviews.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { CriteriaComponent } from './features/criteria/criteria.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'submissions', component: SubmissionListComponent, canActivate: [authGuard] },
  { path: 'submit', component: SubmissionFormComponent, canActivate: [roleGuard(['POD_LEAD'])] },
  { path: 'reviews', component: ReviewsComponent, canActivate: [roleGuard(['TRAINER'])] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [authGuard] },
  { path: 'criteria', component: CriteriaComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];
