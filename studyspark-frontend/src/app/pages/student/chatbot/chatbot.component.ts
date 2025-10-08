import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { DocumentService } from '../../../services/document.service';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
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

  constructor(
    private auth: AuthService,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
    this.loadDocuments();
    this.addBotMessage('Hello! 👋 I\'m your AI study assistant powered by RAG (Retrieval-Augmented Generation). I can answer questions about all your uploaded documents! Ask me anything, or optionally select a specific document to focus on.');
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
    this.addBotMessage(`Great! I'll now focus on "${doc.name}". But remember, I still have access to all your other documents if needed. What would you like to know?`);
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput.trim();
    this.addUserMessage(userMessage);
    this.userInput = '';
    this.isLoading = true;

    // Simulate AI response
    setTimeout(() => {
      this.simulateAIResponse(userMessage);
      this.isLoading = false;
      this.scrollToBottom();
    }, 1500);
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
