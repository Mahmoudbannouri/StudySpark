import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private apiUrl = 'http://localhost:5000/api/flashcards';

  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Generate flashcards for a document
   */
  generateFlashcards(documentId: number, count: number = 10): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/generate`,
      { documentId, count },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * Get all flashcard sets for a document
   */
  getDocumentFlashcards(documentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/document/${documentId}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * Get a single flashcard set by ID
   */
  getFlashcardById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * Delete a flashcard set
   */
  deleteFlashcard(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
