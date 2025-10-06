import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { QuotaService } from '../../../services/quota.service';
import { DocumentService } from '../../../services/document.service';
import { QuotaCardComponent } from '../../../components/quota-card/quota-card/quota-card.component';
import Swal from 'sweetalert2';
import gsap from 'gsap';

interface Document {
  id: number;
  name: string;
  type: string;
  wordCount: number;
  uploadedAt: Date;
  recentActivity?: Activity[];
}

interface Activity {
  name: string;
  icon: string;
  timestamp: Date;
  type: string;
  data?: any;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, QuotaCardComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
  user: any;
  quota: any;
  searchQuery = '';

  // Documents
  documents: Document[] = [];
  selectedDocument: Document | null = null;
  isDragging = false;

  // Activity tracking
  activityCount = {
    flashcards: 0,
    quizzes: 0,
    studyPlans: 0,
    summaries: 0
  };

  constructor(
    private auth: AuthService,
    private quotaService: QuotaService,
    private documentService: DocumentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
    this.loadQuota();
    this.loadDocuments();

    // Animation
    setTimeout(() => {
      gsap.from('.welcome-section', { opacity: 0, y: 30, duration: 0.8 });
    }, 100);
  }

  loadQuota(): void {
    this.quotaService.getMyQuota().subscribe({
      next: (data) => (this.quota = data),
      error: () => Swal.fire('Error', 'Could not load quota', 'error')
    });
  }

  loadDocuments(): void {
    // TODO: Replace with actual API call
    // this.documentService.getUserDocuments().subscribe(...)

    // Mock data for now
    this.documents = [
      {
        id: 1,
        name: 'SQLCOURSE.pdf',
        type: 'application/pdf',
        wordCount: 767,
        uploadedAt: new Date(),
        recentActivity: [
          { name: 'Summary Generated', icon: 'bi-file-text', timestamp: new Date(), type: 'summary' },
          { name: 'Flashcards Created', icon: 'bi-card-list', timestamp: new Date(), type: 'flashcards' }
        ]
      }
    ];
  }

  // File Upload Handlers
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFile(files[0]);
    }
  }

  uploadFile(file: File): void {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'audio/mpeg',
      'audio/wav',
      'video/mp4',
      'video/mpeg'
    ];

    if (file.size > maxSize) {
      Swal.fire('Error', 'File size exceeds 50MB limit', 'error');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      Swal.fire('Error', 'Unsupported file type. Please upload PDF, TXT, MP3, WAV, or MP4 files.', 'error');
      return;
    }

    // Show loading
    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait while we process your document',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Upload to backend
    this.documentService.uploadDocument(file).subscribe({
      next: (response) => {
        Swal.close();
        Swal.fire('Success!', 'Document uploaded successfully', 'success');

        // Add to documents list
        const newDoc: Document = {
          id: response.id || Date.now(),
          name: file.name,
          type: file.type,
          wordCount: response.wordCount || 0,
          uploadedAt: new Date(),
          recentActivity: []
        };

        this.documents.unshift(newDoc);
        this.selectDocument(newDoc);
      },
      error: (error) => {
        Swal.close();
        Swal.fire('Error', error.error?.message || 'Failed to upload document', 'error');
      }
    });
  }

  selectDocument(doc: Document): void {
    this.selectedDocument = doc;

    // Animate tools
    setTimeout(() => {
      gsap.from('.tool-card', {
        opacity: 0,
        y: 20,
        duration: 0.4,
        stagger: 0.1
      });
    }, 100);
  }

  deleteDocument(doc: Document, event: Event): void {
    event.stopPropagation();

    Swal.fire({
      title: 'Delete Document?',
      text: `Are you sure you want to delete "${doc.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentService.deleteDocument(doc.id).subscribe({
          next: () => {
            this.documents = this.documents.filter(d => d.id !== doc.id);
            if (this.selectedDocument?.id === doc.id) {
              this.selectedDocument = null;
            }
            Swal.fire('Deleted!', 'Your document has been deleted.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete document', 'error');
          }
        });
      }
    });
  }

  useTool(toolType: string): void {
    if (!this.selectedDocument) return;

    // Store selected document ID in session or service for the tool page
    sessionStorage.setItem('selectedDocumentId', this.selectedDocument.id.toString());
    sessionStorage.setItem('selectedDocumentName', this.selectedDocument.name);

    // Navigate to the appropriate tool page
    switch (toolType) {
      case 'summary':
        this.router.navigate(['/student/summarizer'], {
          queryParams: { docId: this.selectedDocument.id }
        });
        break;
      case 'flashcards':
        this.router.navigate(['/student/flashcards'], {
          queryParams: { docId: this.selectedDocument.id }
        });
        break;
      case 'quiz':
        this.router.navigate(['/student/quiz'], {
          queryParams: { docId: this.selectedDocument.id }
        });
        break;
      case 'qna':
        this.router.navigate(['/student/chatbot'], {
          queryParams: { docId: this.selectedDocument.id }
        });
        break;
      case 'study-plan':
        this.router.navigate(['/student/study-plan'], {
          queryParams: { docId: this.selectedDocument.id }
        });
        break;
      case 'transcribe':
        this.router.navigate(['/student/transcribe'], {
          queryParams: { docId: this.selectedDocument.id }
        });
        break;
      case 'mind-map':
        this.router.navigate(['/student/mind-map'], {
          queryParams: { docId: this.selectedDocument.id }
        });
        break;
      case 'tutor':
        this.router.navigate(['/student/tutor'], {
          queryParams: { docId: this.selectedDocument.id }
        });
        break;
      case 'visualize':
        this.router.navigate(['/student/visualize'], {
          queryParams: { docId: this.selectedDocument.id }
        });
        break;
      default:
        Swal.fire('Coming Soon', `The ${toolType} feature is under development`, 'info');
    }
  }

  viewActivity(activity: Activity): void {
    Swal.fire('Activity', `Viewing ${activity.name}`, 'info');
    // TODO: Navigate to the specific activity result
  }

  getDocIcon(type: string): string {
    if (type.includes('pdf')) return 'bi bi-file-pdf-fill text-danger';
    if (type.includes('text')) return 'bi bi-file-text-fill text-primary';
    if (type.includes('audio')) return 'bi bi-file-music-fill text-success';
    if (type.includes('video')) return 'bi bi-file-play-fill text-warning';
    return 'bi bi-file-earmark text-secondary';
  }

  logout(): void {
    this.router.navigate(['/logout']);
  }
}
