import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SummaryService } from '../../../services/summary.service';
import { DocumentService } from '../../../services/document.service';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-summarizer',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './summarizer.component.html',
  styleUrl: './summarizer.component.scss'
})
export class SummarizerComponent implements OnInit {
  documentId: number = 0;
  document: any = null;
  summaries: any[] = [];
  selectedLength: 'short' | 'medium' | 'detailed' = 'medium';
  loading = false;
  generating = false;
  error = '';
  user: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private summaryService: SummaryService,
    private documentService: DocumentService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
    this.route.queryParams.subscribe(params => {
      this.documentId = +params['docId'];
      if (!this.documentId) {
        this.router.navigate(['/student/dashboard']);
        return;
      }
      this.loadDocument();
      this.loadSummaries();
    });
  }

  loadDocument(): void {
    this.loading = true;
    this.documentService.getDocumentById(this.documentId).subscribe({
      next: (doc) => {
        this.document = doc;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load document';
        this.loading = false;
      }
    });
  }

  loadSummaries(): void {
    this.summaryService.getDocumentSummaries(this.documentId).subscribe({
      next: (summaries) => {
        this.summaries = summaries;
      },
      error: (err) => {
        console.error('Failed to load summaries', err);
      }
    });
  }

  generateSummary(): void {
    this.generating = true;
    this.error = '';

    this.summaryService.generateSummary(this.documentId, this.selectedLength).subscribe({
      next: (response) => {
        this.summaries.unshift(response.summary);
        this.generating = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to generate summary';
        this.generating = false;
      }
    });
  }

  deleteSummary(summaryId: number): void {
    if (!confirm('Are you sure you want to delete this summary?')) return;

    this.summaryService.deleteSummary(summaryId).subscribe({
      next: () => {
        this.summaries = this.summaries.filter(s => s.id !== summaryId);
      },
      error: (err) => {
        alert('Failed to delete summary');
      }
    });
  }

  selectLength(length: 'short' | 'medium' | 'detailed'): void {
    this.selectedLength = length;
  }

  goBack(): void {
    this.router.navigate(['/student/dashboard']);
  }
}
