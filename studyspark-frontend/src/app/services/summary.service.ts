import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SummaryService {
  private apiUrl = 'http://localhost:5000/api/summaries';

  constructor(private http: HttpClient) {}

  /**
   * Generate summary from uploaded file
   * Sends file directly to backend
   */
  generateSummaryFromFile(
    file: File, 
    length: 'short' | 'medium' | 'detailed',
    userId: number
  ): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('length', length);
    formData.append('userId', userId.toString());

    return this.http.post(`${this.apiUrl}/generate/upload`, formData);
  }

  /**
   * Generate summary from existing document
   * Backend fetches file from storage
   */
  generateSummaryFromDocument(
    documentId: number,
    length: 'short' | 'medium' | 'detailed',
    userId: number
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate/document`, {
      documentId,
      length,
      userId
    });
  }

  /**
   * Get all summaries for a document
   */
  getDocumentSummaries(documentId: number, userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/document/${documentId}?userId=${userId}`);
  }

  /**
   * Get a single summary by ID
   */
  getSummaryById(id: number, userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}?userId=${userId}`);
  }

  /**
   * Delete a summary
   */
  deleteSummary(id: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}?userId=${userId}`);
  }
}