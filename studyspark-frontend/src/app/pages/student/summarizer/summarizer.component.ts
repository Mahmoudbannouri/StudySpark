import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SummaryService } from '../../../services/summary.service';
import { DocumentService, Document } from '../../../services/document.service'; // Import Document interface
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';

interface Summary {
  id: number;
  documentId: number | null;
  userId: number;
  length: 'short' | 'medium' | 'detailed';
  content: string;
  keyPoints: string[];
  generatedAt: string;
  metadata?: {
    wordCount?: number;
    readabilityScore?: number;
    readingLevel?: string;
    language?: string;
    sentiment?: { polarity: number; subjectivity: number };
    keywords?: string[];
    aiModel?: string;
    chunksUsed?: number;
  };
}

@Component({
  selector: 'app-summarizer',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule, RouterModule],
  templateUrl: './summarizer.component.html',
  styleUrls: ['./summarizer.component.scss']
})
export class SummarizerComponent implements OnInit {
  mode: 'upload' | 'select' = 'select';
  selectedFile: File | null = null;
  documents: Document[] = [];
  selectedDocumentId: number | null = null;
  document: Document | null = null;
  summaries: Summary[] = [];
  selectedLength: 'short' | 'medium' | 'detailed' = 'medium';
  loading = false;
  generating = false;
  error = '';
  success = '';
  user: { id: number; fullname: string; email: string } | null = null;

  constructor(
    private router: Router,
    private summaryService: SummaryService,
    private documentService: DocumentService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
    console.log('👤 User:', JSON.stringify(this.user, null, 2));
    if (!this.user?.id) {
      this.error = 'User not authenticated. Please log in.';
      this.router.navigate(['/login']);
      return;
    }
    this.loadDocuments();
  }

  loadDocuments(): void {
    if (!this.user?.id) {
      this.error = 'User not authenticated. Please log in.';
      return;
    }
    this.loading = true;
    this.documentService.getUserDocumentsFiltered(this.user.id, { status: 'ready' }).subscribe({
      next: (docs: Document[]) => {
        console.log('✅ Documents loaded:', JSON.stringify(docs, null, 2));
        this.documents = docs; // Already filtered by 'ready' status
        this.loading = false;
        if (this.documents.length === 0) {
          this.error = 'No documents available. Please upload a document.';
        } else {
          console.log('📜 Available document IDs:', this.documents.map(doc => doc.id));
          if (this.documents.length > 0 && !this.selectedDocumentId) {
            this.selectDocument(this.documents[0].id);
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Failed to load documents:', err);
        this.error = 'Failed to load documents. Please try again later.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectDocument(docId: string | number | null): void {
    console.log('📄 selectDocument called with:', docId, 'Type:', typeof docId);
    const id = docId ? Number(docId) : null;
    console.log('📄 Converted ID:', id, 'Type:', typeof id);
    console.log('📄 Documents array:', JSON.stringify(this.documents.map(doc => ({ id: doc.id, name: doc.name })), null, 2));
    this.selectedDocumentId = id;
    this.document = id ? this.documents.find(doc => doc.id === id) || null : null;
    console.log('📄 Selected document:', this.document ? JSON.stringify(this.document, null, 2) : 'null');
    if (this.document && this.document.status === 'ready') {
      this.error = '';
      this.loadSummariesForDocument(this.document.id);
    } else {
      this.summaries = [];
      if (id) {
        this.error = 'Selected document not found or not ready';
        console.warn('⚠️ Document not found or invalid status for ID:', id);
      }
    }
    this.cdr.detectChanges();
  }

  loadSummariesForDocument(docId: number): void {
    if (!this.user?.id) {
      this.error = 'User not authenticated. Please log in.';
      return;
    }
    console.log('📋 Loading summaries for document:', docId);
    this.summaryService.getDocumentSummaries(docId, this.user.id).subscribe({
      next: (summaries: Summary[]) => {
        console.log('✅ Summaries loaded:', JSON.stringify(summaries, null, 2));
        this.summaries = summaries;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Failed to load summaries:', err);
        this.summaries = [];
        this.error = err.status === 500
          ? 'Failed to load summaries due to a server error. Please try again later.'
          : 'Failed to load summaries: ' + (err.error?.message || 'Unknown error');
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('📎 File selected:', file.name);
      this.error = '';
      this.cdr.detectChanges();
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.error = '';
    this.cdr.detectChanges();
  }

  generateSummary(): void {
    if (!this.user?.id) {
      this.error = 'User not authenticated. Please log in.';
      console.warn('⚠️ No user ID available for summary generation');
      this.cdr.detectChanges();
      return;
    }

    this.error = '';
    this.success = '';
    console.log('🚀 Attempting to generate summary:', {
      mode: this.mode,
      selectedDocumentId: this.selectedDocumentId,
      selectedDocumentIdType: typeof this.selectedDocumentId,
      document: this.document ? JSON.stringify(this.document, null, 2) : 'null',
      selectedLength: this.selectedLength
    });

    if (this.mode === 'upload') {
      if (!this.selectedFile) {
        this.error = 'Please select a file to upload';
        console.warn('⚠️ No file selected for upload');
        this.cdr.detectChanges();
        return;
      }
      this.generateFromUpload();
    } else {
      if (!this.selectedDocumentId || !this.document) {
        this.error = 'Please select a document';
        console.warn('⚠️ No document selected or document is null');
        document.querySelector('.document-selector .form-select')?.classList.add('error');
        this.cdr.detectChanges();
        return;
      }
      document.querySelector('.document-selector .form-select')?.classList.remove('error');
      this.generateFromDocument();
    }
  }

  generateFromUpload(): void {
    if (!this.selectedFile || !this.user?.id) return;

    console.log('🚀 Generating summary from upload:', {
      file: this.selectedFile.name,
      length: this.selectedLength,
      userId: this.user.id
    });

    this.generating = true;
    this.cdr.detectChanges();

    this.summaryService.generateSummaryFromFile(this.selectedFile, this.selectedLength, this.user.id).subscribe({
      next: (response) => {
        console.log('✅ Summary generated from upload:', JSON.stringify(response, null, 2));
        this.success = 'Summary generated successfully!';
        this.summaries.unshift(response.summary);
        this.selectedFile = null;
        this.generating = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Failed to generate summary:', err);
        this.error = err.error?.message || 'Failed to generate summary';
        this.generating = false;
        this.cdr.detectChanges();
      }
    });
  }

  generateFromDocument(): void {
    if (!this.selectedDocumentId || !this.user?.id) return;

    console.log('🚀 Generating summary from document:', {
      documentId: this.selectedDocumentId,
      length: this.selectedLength,
      userId: this.user.id
    });

    this.generating = true;
    this.cdr.detectChanges();

    this.summaryService.generateSummaryFromDocument(this.selectedDocumentId, this.selectedLength, this.user.id).subscribe({
      next: (response) => {
        console.log('✅ Summary generated from document:', JSON.stringify(response, null, 2));
        this.success = 'Summary generated successfully!';
        this.summaries.unshift(response.summary);
        this.generating = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Failed to generate summary:', err);
        this.error = err.error?.message || 'Failed to generate summary';
        this.generating = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteSummary(summaryId: number): void {
    if (!this.user?.id) {
      this.error = 'User not authenticated. Please log in.';
      return;
    }

    if (!confirm('Are you sure you want to delete this summary?')) {
      return;
    }

    console.log('🗑️ Deleting summary:', summaryId);

    this.summaryService.deleteSummary(summaryId, this.user.id).subscribe({
      next: () => {
        console.log('✅ Summary deleted');
        this.summaries = this.summaries.filter(s => s.id !== summaryId);
        this.success = 'Summary deleted successfully';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Failed to delete summary:', err);
        this.error = 'Failed to delete summary';
        this.cdr.detectChanges();
      }
    });
  }

  selectLength(length: 'short' | 'medium' | 'detailed'): void {
    this.selectedLength = length;
    console.log('📏 Selected length:', length);
    this.cdr.detectChanges();
  }

  switchMode(mode: 'upload' | 'select'): void {
    this.mode = mode;
    this.error = '';
    this.success = '';
    this.selectedFile = null;
    this.selectedDocumentId = null;
    this.document = null;
    this.summaries = [];
    console.log('🔄 Switched to mode:', mode);
    this.cdr.detectChanges();
  }

  goBack(): void {
    this.router.navigate(['/student/dashboard']);
  }
}