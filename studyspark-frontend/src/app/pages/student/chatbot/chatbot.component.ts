import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { DocumentService } from '../../../services/document.service';
import { ChatService } from '../../../services/chat.service';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatApiMessage {
  id: number;
  userId: number;
  documentId?: number | null;
  question: string;
  answer: string;
  sources?: any;
  confidence?: number | null;
  createdAt: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: Message[] = [];
  userInput = '';
  isLoading = false;
  selectedDocument: string | null = null;
  showDocSelector = false;
  user: any = null;
  documents: any[] = [];
  sessions: any[] = [];
  activeSessionId: number | null = null;
  editingSessionId: number | null = null;
  editingSessionTitle: string = '';
  readonly SESSION_KEY = 'ss_activeSessionId';

  constructor(
    private auth: AuthService,
    private documentService: DocumentService,
    private chatService: ChatService
  ) {}
  

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
    this.loadDocuments();
    this.addBotMessage('Hello! 👋 I\'m your AI study assistant powered by RAG (Retrieval-Augmented Generation). I can answer questions about all your uploaded documents! Ask me anything, or optionally select a specific document to focus on.');
    this.loadSessions(() => {
      // After sessions loaded, auto-select session
      const storedId = this.getSessionFromStorage();
      if (storedId && this.sessions.some(s => s.id === storedId)) {
        this.openSession(this.sessions.find(s => s.id === storedId));
      } else if (this.sessions.length) {
        // Open most recent
        this.openSession(this.sessions[0]);
      } else {
        // Fallback: show all chat messages
        this.messages = [];
        this.loadAllChatHistory();
        this.activeSessionId = null;
      }
    });
  }

  loadDocuments(): void {
    this.documentService.getUserDocuments().subscribe({
      next: (documents) => {
        this.documents = documents.filter(doc => doc.status === 'ready');
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.documents = [];
      }
    });
  }

  selectDocument(doc: any): void {
    this.selectedDocument = doc.name;
    // Load chat history for this specific document
    this.messages = [];
    this.loadDocumentChat(doc.id);
    this.addBotMessage(`Great! I'll now focus on "${doc.name}". But remember, I still have access to all your other documents if needed. What would you like to know?`);
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;
  
    const userMessage = this.userInput.trim();
    this.addUserMessage(userMessage);
    this.userInput = '';
    this.isLoading = true;
  
    const documentId = this.selectedDocument ? this.documents.find(d => d.name === this.selectedDocument)?.id : null;
  
    this.chatService.askQuestion(userMessage, documentId, false, this.activeSessionId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.chat?.answer) {
          this.addBotMessage(res.chat.answer);
          // bump session if created
          if (res?.chat?.sessionId) {
            this.activeSessionId = res.chat.sessionId;
            this.setSessionToStorage(res.chat.sessionId);
          }
        } else if (res?.answer) {
          this.addBotMessage(res.answer);
        } else {
          this.addBotMessage('⚠️ No response received from AI.');
        }
        // Always refresh session list after send
        this.loadSessions();
      },
      error: (err) => {
        console.error('Chat error:', err);
        this.isLoading = false;
        this.addBotMessage('❌ Error connecting to AI assistant.');
      }
    });
  }
  

  private simulateAIResponse(question: string): void {
    // This is a mock response. In production, this would call your backend RAG model
    const responses = [
      this.selectedDocument
        ? `Based on "${this.selectedDocument}" and your other uploaded resources, here's what I found:\n\nThe concept you're asking about is explained in detail. The key points are: it involves a systematic approach to understanding the fundamentals, and it's important to practice regularly. I also found related information in your other documents that might help.`
        : `Based on all your uploaded documents, here's what I found:\n\nThe concept you're asking about appears in several of your materials. The key points are: it involves a systematic approach to understanding the fundamentals, and it's important to practice regularly. The information is most detailed in your lecture notes.`,
      this.selectedDocument
        ? `Great question! According to "${this.selectedDocument}":\n\n1. First, understand the basic principles\n2. Apply them through practical examples\n3. Review regularly to reinforce learning\n\nI also found complementary information in your other documents. Would you like me to elaborate?`
        : `Great question! From analyzing your uploaded documents, I found:\n\n1. First, understand the basic principles\n2. Apply them through practical examples\n3. Review regularly to reinforce learning\n\nThis information comes from multiple sources in your library. Would you like me to be more specific?`,
      this.selectedDocument
        ? `From "${this.selectedDocument}" and cross-referencing with your other materials, I can see that this topic is covered extensively. The main idea is that consistent study and application of concepts leads to better retention and understanding.`
        : `From analyzing all your documents, I can see this topic is covered in multiple places. The main idea is that consistent study and application of concepts leads to better retention and understanding. Let me know if you want me to focus on a specific document!`
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    this.addBotMessage(randomResponse);
  }

  private loadAllChatHistory(): void {
    this.chatService.getAllUserChats().subscribe({
      next: (items: ChatApiMessage[]) => {
        // API returns newest first; render oldest to newest
        const ordered = [...items].reverse();
        for (const msg of ordered) {
          // push user question then bot answer
          this.messages.push({ text: msg.question, isUser: true, timestamp: new Date(msg.createdAt) });
          this.messages.push({ text: msg.answer, isUser: false, timestamp: new Date(msg.createdAt) });
        }
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Error loading chat history:', err);
      }
    });
  }

  private loadDocumentChat(documentId: number): void {
    this.chatService.getDocumentChat(documentId).subscribe({
      next: (items: any[]) => {
        const ordered = [...items]; // already ASC by createdAt per backend
        for (const msg of ordered) {
          this.messages.push({ text: msg.question, isUser: true, timestamp: new Date(msg.createdAt) });
          this.messages.push({ text: msg.answer, isUser: false, timestamp: new Date(msg.createdAt) });
        }
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Error loading document chat:', err);
      }
    });
  }

  private loadSessions(cb?: () => void): void {
    this.chatService.listSessions().subscribe({
      next: (items) => {
        this.sessions = (items || []).map((s: any) => ({ ...s, messageCount: 0 }));
        if (!this.sessions.length) {
          if (cb) cb();
          return;
        }
        // Fetch message count for each session in parallel
        let done = 0;
        this.sessions.forEach((session, idx) => {
          this.chatService.getSessionMessages(session.id).subscribe({
            next: (msgs) => {
              this.sessions[idx].messageCount = msgs ? msgs.length : 0;
              done++;
              if (done === this.sessions.length && cb) cb();
            },
            error: () => {
              done++;
              if (done === this.sessions.length && cb) cb();
            }
          });
        });
        // Cover sessions=0 as completion
        if (this.sessions.length === 0 && cb) cb();
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        if (cb) cb();
      }
    });
  }

  startEditingSession(session: any): void {
    this.editingSessionId = session.id;
    this.editingSessionTitle = session.title || '';
    setTimeout(() => {
      // Focus input
      const input: HTMLInputElement | null = document.querySelector(`input[name='title-${session.id}']`);
      if (input) input.focus();
    }, 10);
  }

  saveEditingSession(session: any, event: Event): void {
    event.preventDefault();
    if (this.editingSessionTitle && this.editingSessionId) {
      this.chatService.renameSession(this.editingSessionId, this.editingSessionTitle).subscribe({
        next: () => {
          this.editingSessionId = null;
          this.editingSessionTitle = '';
          this.loadSessions(() => {
            // After reload, retry selection
            const found = this.sessions.find(s => s.id === session.id);
            if (found) this.openSession(found);
          });
        },
        error: (err) => {
          alert('Could not rename session.');
          this.editingSessionId = null;
          this.editingSessionTitle = '';
        }
      });
    }
  }

  cancelEditingSession(event: Event): void {
    if(event) event.preventDefault();
    this.editingSessionId = null;
    this.editingSessionTitle = '';
  }

  openSession(session: any): void {
    if (!session) return;
    this.activeSessionId = session.id;
    this.setSessionToStorage(session.id);
    this.messages = [];
    this.chatService.getSessionMessages(session.id).subscribe({
      next: (items) => {
        for (const msg of items) {
          this.messages.push({ text: msg.question, isUser: true, timestamp: new Date(msg.createdAt) });
          this.messages.push({ text: msg.answer, isUser: false, timestamp: new Date(msg.createdAt) });
        }
        this.scrollToBottom();
      },
      error: (err) => console.error('Error loading session messages:', err)
    });
  }

  onNewSession(): void {
    this.chatService.createSession('New session').subscribe({
      next: (session) => {
        this.sessions.unshift(session);
        this.setSessionToStorage(session.id);
        this.openSession(session);
        this.loadSessions(); // Always reload
      },
      error: (err) => console.error('Error creating session:', err)
    });
  }

  private setSessionToStorage(id: number | null) {
    if (id) {
      localStorage.setItem(this.SESSION_KEY, String(id));
    } else {
      localStorage.removeItem(this.SESSION_KEY);
    }
  }
  private getSessionFromStorage(): number | null {
    const val = localStorage.getItem(this.SESSION_KEY);
    return val ? Number(val) : null;
  }

  private addUserMessage(text: string): void {
    this.messages.push({
      text,
      isUser: true,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  private addBotMessage(text: string): void {
    this.messages.push({
      text,
      isUser: false,
      timestamp: new Date()
    });
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
