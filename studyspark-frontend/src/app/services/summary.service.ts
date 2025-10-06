import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SummaryService {
  private apiUrl = 'http://localhost:5000/api/summaries';

  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Generate summary for a document
   */
  generateSummary(documentId: number, length: 'short' | 'medium' | 'detailed'): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/generate`,
      { documentId, length },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * Get all summaries for a document
   */
  getDocumentSummaries(documentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/document/${documentId}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * Get a single summary by ID
   */
  getSummaryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * Delete a summary
   */
  deleteSummary(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
