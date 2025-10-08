import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { DocumentService } from '../../../services/document.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  documents: any[] = [];
  isLoading = true;

  constructor(
    private documentService: DocumentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.documentService.getUserDocuments().subscribe({
      next: (documents) => {
        this.documents = documents;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load documents. Please try again.',
        });
      }
    });
  }

  deleteDocument(id: number, name: string): void {
    Swal.fire({
      title: 'Delete Document?',
      text: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentService.deleteDocument(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Document has been deleted.', 'success');
            this.loadDocuments(); // Reload the list
          },
          error: (error) => {
            console.error('Delete error:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete document. Please try again.',
            });
          }
        });
      }
    });
  }

  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'bi-file-pdf text-danger';
    if (fileType.includes('text')) return 'bi-file-text text-primary';
    if (fileType.includes('audio')) return 'bi-file-music text-info';
    if (fileType.includes('video')) return 'bi-file-play text-success';
    return 'bi-file text-secondary';
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'ready':
        return 'badge bg-success';
      case 'processing':
        return 'badge bg-warning';
      case 'error':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  navigateToUpload(): void {
    this.router.navigate(['/student/upload']);
  }

  getDocumentsByStatus(status: string): number {
    return this.documents.filter(doc => doc.status === status).length;
  }

  viewDocument(id: number): void {
    this.documentService.getDocumentById(id).subscribe({
      next: (document) => {
        Swal.fire({
          title: document.name,
          html: `
            <div style="text-align: left;">
              <p><strong>File Type:</strong> ${document.fileType}</p>
              <p><strong>File Size:</strong> ${this.formatFileSize(document.fileSize)}</p>
              <p><strong>Word Count:</strong> ${document.wordCount || 0}</p>
              <p><strong>Status:</strong> <span class="badge ${this.getStatusBadge(document.status)}">${document.status}</span></p>
              <p><strong>Uploaded:</strong> ${this.formatDate(document.uploadedAt)}</p>
              ${document.extractedText ? `<hr><p><strong>Content Preview:</strong></p><div style="max-height: 200px; overflow-y: auto; text-align: left; padding: 10px; background: #f8f9fa; border-radius: 5px;">${document.extractedText.substring(0, 500)}...</div>` : ''}
            </div>
          `,
          width: 600
        });
      },
      error: (error) => {
        console.error('Error fetching document:', error);
        Swal.fire('Error', 'Failed to load document details', 'error');
      }
    });
  }
}
