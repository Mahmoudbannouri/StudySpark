import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  selectedFile: File | null = null;
  isDragging = false;
  uploadProgress = 0;
  isUploading = false;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.validateAndSetFile(file);
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
      this.validateAndSetFile(files[0]);
    }
  }

  validateAndSetFile(file: File): void {
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
      Swal.fire('Error', 'Unsupported file type', 'error');
      return;
    }

    this.selectedFile = file;
  }

  removeFile(): void {
    this.selectedFile = null;
    this.uploadProgress = 0;
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.isUploading = false;
        Swal.fire('Success!', 'File uploaded successfully', 'success');
        this.selectedFile = null;
        this.uploadProgress = 0;
      }
    }, 200);

    // TODO: Implement actual file upload to backend
    // this.documentService.uploadDocument(this.selectedFile).subscribe(...)
  }

  getFileIcon(type: string): string {
    if (type.includes('pdf')) return 'bi-file-pdf';
    if (type.includes('text')) return 'bi-file-text';
    if (type.includes('audio')) return 'bi-file-music';
    if (type.includes('video')) return 'bi-file-play';
    return 'bi-file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
