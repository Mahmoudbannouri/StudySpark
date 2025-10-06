import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubscriptionService } from '../../../services/subscription.service';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent implements OnInit {
  currentSubscription: any = null;
  plans: any = null;
  loading = true;
  user: any = null;

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
    console.log('User Info:', this.user); // Debug log
    console.log('User ID:', this.auth.getUserId()); // Debug log
    this.loadSubscription();
    this.loadPlans();
  }

  loadSubscription(): void {
    this.subscriptionService.getMySubscription().subscribe({
      next: (data) => {
        this.currentSubscription = data;
        this.loading = false;
      },
      error: () => {
        Swal.fire('Error', 'Could not load subscription', 'error');
        this.loading = false;
      }
    });
  }

  loadPlans(): void {
    this.subscriptionService.getPlans().subscribe({
      next: (data) => {
        this.plans = data.plans;
      },
      error: () => {
        console.error('Failed to load plans');
      }
    });
  }

  subscribe(tier: 'free' | 'pro' | 'vip'): void {
    const plan = this.plans[tier];

    Swal.fire({
      title: `Subscribe to ${plan.name}?`,
      html: `
        <p><strong>Price:</strong> $${plan.price}${tier !== 'free' ? '/week' : ''}</p>
        <p><strong>Quotas:</strong></p>
        <ul style="text-align: left;">
          <li>Summaries: ${plan.quotas.summaries}</li>
          <li>Flashcards: ${plan.quotas.flashcards}</li>
          <li>Quizzes: ${plan.quotas.quizzes}</li>
          <li>Chats: ${plan.quotas.chats}</li>
          <li>Study Plans: ${plan.quotas.studyPlans}</li>
          <li>Max Uploads: ${plan.quotas.maxUploads}</li>
        </ul>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Subscribe',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptionService.subscribe(tier).subscribe({
          next: (response) => {
            Swal.fire('Success!', response.message, 'success');
            this.loadSubscription();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Subscription failed', 'error');
          }
        });
      }
    });
  }

  cancelSubscription(): void {
    Swal.fire({
      title: 'Cancel Subscription?',
      text: 'You will be downgraded to the Free plan',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptionService.cancelSubscription().subscribe({
          next: (response) => {
            Swal.fire('Cancelled', response.message, 'info');
            this.loadSubscription();
          },
          error: () => {
            Swal.fire('Error', 'Failed to cancel subscription', 'error');
          }
        });
      }
    });
  }

  getDaysRemaining(): number {
    if (!this.currentSubscription?.endDate) return 0;
    const end = new Date(this.currentSubscription.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  goBack(): void {
    this.router.navigate(['/student/dashboard']);
  }
}
