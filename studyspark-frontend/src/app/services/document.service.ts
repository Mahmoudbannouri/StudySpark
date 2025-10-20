import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// Define the Document interface
export interface Document {
  id: number;
  name: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  wordCount?: number;
  status: 'processing' | 'ready' | 'error';
  uploadedAt: string;
}
@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:5000/api/documents';

  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Upload a document (PDF, TXT, audio, video)
   */
  uploadDocument(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/upload`, formData, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * Get all documents for the current user
   */
  getUserDocuments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * Get a single document by ID
   */
  getDocumentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * Delete a document
   */
  deleteDocument(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }
  /**
   * Get documents for the current user with optional filters (e.g., status or file type)
   * Useful for SummarizerComponent to fetch only 'ready' documents or specific file types
   */
  getUserDocumentsFiltered(
    userId: number,
    filters: { status?: 'processing' | 'ready' | 'error'; fileType?: string } = {}
  ): Observable<Document[]> {
    let query = `userId=${userId}`;
    if (filters.status) {
      query += `&status=${filters.status}`;
    }
    if (filters.fileType) {
      query += `&fileType=${filters.fileType}`;
    }

    return this.http.get<Document[]>(`${this.apiUrl}?${query}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

}

