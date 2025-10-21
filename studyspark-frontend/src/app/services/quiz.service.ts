import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { API_BASE } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = `${API_BASE}/quizzes`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Generate quiz for a document
   */
  generateQuiz(documentId: number, count: number = 10): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/generate`,
      { documentId, count },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * Submit quiz answers
   */
  submitQuiz(quizId: number, answers: number[]): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/submit`,
      { quizId, answers },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * Get all quizzes for a document
   */
  getDocumentQuizzes(documentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/document/${documentId}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * Get a single quiz by ID
   */
  getQuizById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * Delete a quiz
   */
  deleteQuiz(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
