import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Preferences } from '../pages/student/study-plan/preference-modal.component';
import { AuthService } from './auth.service';
import { API_BASE } from '../api.config';
interface Task {
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  topic: string;
  title: string;
  description: string;
 
}

export interface StudyPlan {
  documents: number[]; // document IDs
  freeDays: string[];
  dailyHours: { [day: string]: string };
  sessionDuration: number;
  tasks: Task[];
}

@Injectable({
  providedIn: 'root'
})
export class StudyPlanService {
  private baseUrl = `${API_BASE}/study-plans`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getStudyPlan(): Observable<StudyPlan> {
    return this.http.get<StudyPlan>(`${this.baseUrl}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  createOrUpdateStudyPlan(payload: any): Observable<StudyPlan> {
    return this.http.post<StudyPlan>(`${this.baseUrl}`, payload, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
