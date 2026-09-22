import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Criteria,
  DecisionRequest,
  NotificationItem,
  PodLeadDashboard,
  Submission,
  SubmissionRequest,
  TrainerDashboard
} from '../models/project.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api`;

  constructor(private readonly http: HttpClient) {}

  trainerDashboard(): Observable<TrainerDashboard> {
    return this.http.get<TrainerDashboard>(`${this.baseUrl}/trainer/dashboard`);
  }

  podLeadDashboard(): Observable<PodLeadDashboard> {
    return this.http.get<PodLeadDashboard>(`${this.baseUrl}/pod-lead/dashboard`);
  }

  criteria(): Observable<Criteria> {
    return this.http.get<Criteria>(`${this.baseUrl}/criteria`);
  }

  submissions(): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.baseUrl}/submissions`);
  }

  submission(id: number): Observable<Submission> {
    return this.http.get<Submission>(`${this.baseUrl}/submissions/${id}`);
  }

  createSubmission(body: SubmissionRequest): Observable<Submission> {
    return this.http.post<Submission>(`${this.baseUrl}/submissions`, body);
  }

  revise(id: number, body: SubmissionRequest): Observable<Submission> {
    return this.http.put<Submission>(`${this.baseUrl}/submissions/${id}`, body);
  }

  decide(id: number, body: DecisionRequest): Observable<Submission> {
    return this.http.post<Submission>(`${this.baseUrl}/submissions/${id}/decision`, body);
  }

  notifications(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(`${this.baseUrl}/notifications`);
  }

  markRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/notifications/${id}/read`, {});
  }
}
