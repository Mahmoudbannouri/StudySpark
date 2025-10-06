import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

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
    return this.http.get<any[]>(`${this.apiUrl}/my-documents`, {
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
   * Generate summary for a document
   */
  generateSummary(documentId: number, length: 'short' | 'medium' | 'detailed'): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${documentId}/summarize`,
      { length },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * Generate flashcards from a document
   */
  generateFlashcards(documentId: number, count: number = 10): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${documentId}/flashcards`,
      { count },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * Generate quiz from a document
   */
  generateQuiz(documentId: number, count: number = 10): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${documentId}/quiz`,
      { count },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * Ask a question about a document (RAG chatbot)
   */
  askQuestion(documentId: number, question: string, useWebSearch: boolean = false): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${documentId}/ask`,
      { question, useWebSearch },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * Generate a study plan
   */
  generateStudyPlan(documentId: number, examDate: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${documentId}/study-plan`,
      { examDate },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * Generate a mind map
   */
  generateMindMap(documentId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${documentId}/mind-map`,
      {},
      { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * Transcribe audio/video file
   */
  transcribeMedia(documentId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${documentId}/transcribe`,
      {},
      { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * AI Tutor interaction
   */
  aiTutorInteraction(documentId: number, mode: string, input: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${documentId}/tutor`,
      { mode, input },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * Generate concept visualization
   */
  visualizeConcept(documentId: number, concept: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${documentId}/visualize`,
      { concept },
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
