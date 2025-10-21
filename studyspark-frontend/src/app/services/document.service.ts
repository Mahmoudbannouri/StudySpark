import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { API_BASE } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${API_BASE}/documents`;

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
}
