import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/api/chat';

  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Ask a question (with optional document context)
   */
  askQuestion(question: string, documentId?: number, useWebSearch: boolean = false): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/ask`,
      { documentId: documentId || null, question, useWebSearch },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * Get chat history for a specific document
   */
  getDocumentChat(documentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/document/${documentId}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * Get all user chats
   */
  getAllUserChats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * Delete a chat message
   */
  deleteChatMessage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
