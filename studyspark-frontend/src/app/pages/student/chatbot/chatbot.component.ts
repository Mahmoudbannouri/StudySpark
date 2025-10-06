import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';

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

  // Mock documents list
  documents = [
    { id: 1, name: 'Introduction to Machine Learning.pdf' },
    { id: 2, name: 'Data Structures Chapter 3.pdf' },
    { id: 3, name: 'Physics Lecture Notes.pdf' }
  ];

  ngOnInit(): void {
    this.addBotMessage('Hello! 👋 I\'m your AI study assistant. Select a document and ask me any questions about it!');
  }

  selectDocument(doc: any): void {
    this.selectedDocument = doc.name;
    this.addBotMessage(`Great! I'm now ready to answer questions about "${doc.name}". What would you like to know?`);
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;
    if (!this.selectedDocument) {
      this.addBotMessage('Please select a document first before asking questions.');
      return;
    }

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
      `Based on the document "${this.selectedDocument}", here's what I found:\n\nThe concept you're asking about is explained in detail on page 12. The key points are: it involves a systematic approach to understanding the fundamentals, and it's important to practice regularly.`,
      `Great question! According to "${this.selectedDocument}":\n\n1. First, understand the basic principles\n2. Apply them through practical examples\n3. Review regularly to reinforce learning\n\nWould you like me to elaborate on any of these points?`,
      `From "${this.selectedDocument}", I can see that this topic is covered extensively. The main idea is that consistent study and application of concepts leads to better retention and understanding.`
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
