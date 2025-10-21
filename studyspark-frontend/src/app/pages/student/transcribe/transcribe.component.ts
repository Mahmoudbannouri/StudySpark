import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { DocumentService } from '../../../services/document.service';

interface TranscriptionSegment {
  timestamp: string;
  speaker?: string;
  text: string;
}

interface Transcription {
  id: number;
  title: string;
  duration: string;
  date: Date;
  videoUrl?: string;
  segments: TranscriptionSegment[];
  summary: string;
  keyPoints: string[];
}

@Component({
  selector: 'app-transcribe',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './transcribe.component.html',
  styleUrls: ['./transcribe.component.scss']
})
export class TranscribeComponent implements OnInit {
  user: any = null;

  // Upload
  uploadMethod: 'file' | 'youtube' | 'record' = 'file';
  selectedFile: File | null = null;
  youtubeUrl = '';
  isRecording = false;
  recordingTime = '00:00';
  processing = false;

  // Options
  options = {
    timestamps: true,
    speakers: true,
    summary: true,
    keyPoints: true,
    language: 'en'
  };

  // Current transcription
  currentTranscription: Transcription | null = null;
  activeTab: 'transcription' | 'summary' | 'keyPoints' = 'transcription';
  searchQuery = '';

  // Recent transcriptions
  recentTranscriptions: Transcription[] = [
    {
      id: 1,
      title: 'Machine Learning Lecture 5',
      duration: '45:30',
      date: new Date(Date.now() - 86400000),
      segments: [],
      summary: '',
      keyPoints: []
    },
    {
      id: 2,
      title: 'Python Tutorial - Data Structures',
      duration: '32:15',
      date: new Date(Date.now() - 172800000),
      segments: [],
      summary: '',
      keyPoints: []
    }
  ];

  constructor(private auth: AuthService,
    private documentService: DocumentService
  ) { }

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  toggleRecording(): void {
    this.isRecording = !this.isRecording;

    if (this.isRecording) {
      // Simulate recording time
      let seconds = 0;
      const interval = setInterval(() => {
        if (!this.isRecording) {
          clearInterval(interval);
          return;
        }
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        this.recordingTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }, 1000);
    }
  }

  canStartTranscription(): boolean {
    if (this.uploadMethod === 'file') return this.selectedFile !== null;
    if (this.uploadMethod === 'youtube') return this.youtubeUrl.trim() !== '';
    if (this.uploadMethod === 'record') return !this.isRecording && this.recordingTime !== '00:00';
    return false;
  }

  /*  startTranscription(): void {
      this.processing = true;

      // Simulate processing
      setTimeout(() => {
        this.currentTranscription = this.generateMockTranscription();
        this.processing = false;
      }, 3000);
    }
  */
  generateMockTranscription(): Transcription {
    const title = this.uploadMethod === 'file'
      ? this.selectedFile?.name.replace(/\.[^/.]+$/, '') || 'New Video'
      : this.uploadMethod === 'youtube'
        ? 'YouTube Video'
        : 'Recorded Video';

    const segments: TranscriptionSegment[] = [
      {
        timestamp: '00:00',
        speaker: 'Speaker 1',
        text: 'Welcome to today\'s lecture on machine learning fundamentals. We\'re going to cover several important topics including supervised learning, unsupervised learning, and neural networks.'
      },
      {
        timestamp: '00:15',
        speaker: 'Speaker 1',
        text: 'Let\'s start with supervised learning. This is a type of machine learning where we train our model using labeled data. The model learns from examples and can then make predictions on new, unseen data.'
      },
      {
        timestamp: '00:45',
        speaker: 'Speaker 1',
        text: 'Common applications of supervised learning include classification problems like spam detection, and regression problems like predicting house prices.'
      },
      {
        timestamp: '01:20',
        speaker: 'Speaker 1',
        text: 'Moving on to unsupervised learning, this approach doesn\'t use labeled data. Instead, the algorithm tries to find patterns and structure in the data on its own.'
      },
      {
        timestamp: '01:50',
        speaker: 'Speaker 1',
        text: 'Clustering is a popular unsupervised learning technique where we group similar data points together. This is useful for customer segmentation and anomaly detection.'
      },
      {
        timestamp: '02:25',
        speaker: 'Speaker 1',
        text: 'Finally, let\'s discuss neural networks. These are computing systems inspired by biological neural networks in animal brains. They consist of layers of interconnected nodes that process information.'
      },
      {
        timestamp: '03:00',
        speaker: 'Speaker 1',
        text: 'Deep learning uses neural networks with many layers to learn complex patterns. This has led to breakthroughs in computer vision, natural language processing, and speech recognition.'
      },
      {
        timestamp: '03:40',
        speaker: 'Speaker 1',
        text: 'In summary, machine learning offers powerful tools for solving complex problems. Whether you use supervised learning, unsupervised learning, or deep learning depends on your specific use case and available data.'
      }
    ];

    const summary = 'This lecture covers the fundamentals of machine learning, including three main approaches: supervised learning (training with labeled data for classification and regression), unsupervised learning (finding patterns without labels through clustering), and neural networks (brain-inspired systems that enable deep learning). These techniques have revolutionized fields like computer vision, NLP, and speech recognition.';

    const keyPoints = [
      'Supervised learning uses labeled data to train models for predictions',
      'Classification and regression are common supervised learning applications',
      'Unsupervised learning finds patterns in unlabeled data',
      'Clustering groups similar data points for segmentation and anomaly detection',
      'Neural networks are inspired by biological brain structures',
      'Deep learning uses multi-layer neural networks for complex pattern recognition',
      'Machine learning has enabled breakthroughs in computer vision and NLP'
    ];

    return {
      id: Date.now(),
      title,
      duration: '04:00',
      date: new Date(),
      segments,
      summary,
      keyPoints
    };
  }

  isHighlighted(segment: TranscriptionSegment): boolean {
    if (!this.searchQuery.trim()) return false;
    return segment.text.toLowerCase().includes(this.searchQuery.toLowerCase());
  }

  downloadTranscription(): void {
    if (!this.currentTranscription) return;

    const content = this.formatTranscriptionForDownload();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentTranscription.title}_transcription.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  formatTranscriptionForDownload(): string {
    if (!this.currentTranscription) return '';

    let content = `${this.currentTranscription.title}\n`;
    content += `Duration: ${this.currentTranscription.duration}\n`;
    content += `Date: ${this.currentTranscription.date.toLocaleString()}\n\n`;
    content += '='.repeat(50) + '\n\n';

    if (this.options.summary && this.currentTranscription.summary) {
      content += 'SUMMARY:\n';
      content += this.currentTranscription.summary + '\n\n';
      content += '='.repeat(50) + '\n\n';
    }

    if (this.options.keyPoints && this.currentTranscription.keyPoints.length > 0) {
      content += 'KEY POINTS:\n';
      this.currentTranscription.keyPoints.forEach((point, i) => {
        content += `${i + 1}. ${point}\n`;
      });
      content += '\n' + '='.repeat(50) + '\n\n';
    }

    content += 'FULL TRANSCRIPTION:\n\n';
    this.currentTranscription.segments.forEach(segment => {
      if (this.options.timestamps) {
        content += `[${segment.timestamp}] `;
      }
      if (this.options.speakers && segment.speaker) {
        content += `${segment.speaker}: `;
      }
      content += segment.text + '\n\n';
    });

    return content;
  }

  copyTranscription(): void {
    const content = this.formatTranscriptionForDownload();
    navigator.clipboard.writeText(content).then(() => {
      alert('Transcription copied to clipboard!');
    });
  }

  startNew(): void {
    this.currentTranscription = null;
    this.selectedFile = null;
    this.youtubeUrl = '';
    this.recordingTime = '00:00';
    this.searchQuery = '';
    this.activeTab = 'transcription';
  }

  loadTranscription(trans: Transcription): void {
    // In a real app, this would load the full transcription from backend
    this.currentTranscription = this.generateMockTranscription();

    this.currentTranscription.title = trans.title;
    this.currentTranscription.duration = trans.duration;
    this.currentTranscription.date = trans.date;
  }

  startTranscription(): void {
    if (!this.selectedFile) return;

    this.processing = true;

    this.documentService.uploadVideo(this.selectedFile).subscribe({
      next: (response) => {
        console.log('Response from backend:', response.transcription);

        // Example: Adjust according to what your backend returns
        this.currentTranscription = {
          id: Date.now(),
          title: this.selectedFile?.name.replace(/\.[^/.]+$/, '') || 'Uploaded Video',
          duration: response.duration || 'Unknown',
          date: new Date(),
          segments: response.segments || [],
          summary: response.transcription || 'No summary provided.',
          keyPoints: response.key_points || [],
        };


        this.processing = false;
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.processing = false;
      }
    });
  }

}
