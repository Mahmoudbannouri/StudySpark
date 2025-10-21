import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SubscriptionService } from '../../services/subscription.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isSidebarOpen = true;
  user: any = null;
  subscription: any = null;

  menuItems: MenuItem[] = [
    { icon: 'bi-house-door', label: 'Dashboard', route: '/student' },
    { icon: 'bi-star', label: 'My Subscription', route: '/student/subscription' },
    { icon: 'bi-cloud-upload', label: 'Upload Document', route: '/student/upload' },
    { icon: 'bi-chat-dots', label: 'Q&A Chatbot', route: '/student/chatbot' },
    { icon: 'bi-file-text', label: 'Summarizer', route: '/student/summarizer' },
    { icon: 'bi-card-list', label: 'Flashcards', route: '/student/flashcards' },
    { icon: 'bi-question-circle', label: 'Quiz Generator', route: '/student/quiz' },
    { icon: 'bi-calendar-check', label: 'Study Plan', route: '/student/study-plan' },
    { icon: 'bi-diagram-3', label: 'Mind Map', route: '/student/mind-map' },
    { icon: 'bi-camera-video', label: 'Transcribe Media', route: '/student/transcribe' },
    { icon: 'bi-image', label: 'Visualize Concepts', route: '/student/visualize' },
    { icon: 'bi-people', label: 'Study Groups (AI)', route: '/student/studygroups' },
  ];

  constructor(
    private router: Router,
    private auth: AuthService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
    this.loadSubscription();
  }

  loadSubscription(): void {
    this.subscriptionService.getMySubscription().subscribe({
      next: (data) => {
        this.subscription = data;
      },
      error: () => {
        console.error('Failed to load subscription');
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(): void {
    this.router.navigate(['/logout']);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
