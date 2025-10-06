import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { QuotaService } from '../../../services/quota.service';
import { QuotaCardComponent } from '../../../components/quota-card/quota-card/quota-card.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, QuotaCardComponent, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  selectedUser: any = null;
  selectedQuota: any = null;
  loading = false;
  loadingQuota = false;
  statistics: any = null;

  // Quota management properties
  selectedPlan: string = 'free';
  availablePlans = ['free', 'basic', 'premium', 'enterprise'];

  // Custom quota override
  customQuotas = {
    maxUploads: 0,
    summaries: 0,
    flashcards: 0,
    quizzes: 0,
    chats: 0,
    studyPlans: 0
  };

  usedQuotas = {
    usedUploads: 0,
    usedSummaries: 0,
    usedFlashcards: 0,
    usedQuizzes: 0,
    usedChats: 0,
    usedStudyPlans: 0
  };

  constructor(
    private userService: UserService,
    private quotaService: QuotaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchStatistics();
  }

  fetchUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        console.log('Loaded users:', this.users);
      },
      error: (err) => Swal.fire('Error', err.error?.message || 'Failed to load users', 'error'),
      complete: () => (this.loading = false)
    });
  }

  fetchStatistics(): void {
    this.quotaService.getQuotaStatistics().subscribe({
      next: (stats) => {
        console.log('Quota statistics:', stats);

        // Calculate statistics
        const totalQuotas = this.calculateTotalQuotas(stats);
        const avgUsage = this.calculateAverageUsage(stats);

        this.statistics = {
          totalUsers: stats.overview?.totalUsers || 0,
          activeUsers: stats.overview?.activeUsers || 0,
          totalQuotas: totalQuotas,
          avgUsage: avgUsage
        };
      },
      error: (err) => {
        console.error('Failed to load statistics:', err);
        // Set default statistics if fails
        this.statistics = {
          totalUsers: 0,
          activeUsers: 0,
          totalQuotas: 0,
          avgUsage: 0
        };
      }
    });
  }

  calculateTotalQuotas(stats: any): number {
    if (!stats.usageBreakdown) return 0;
    return Object.values(stats.usageBreakdown).reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  }

  calculateAverageUsage(stats: any): number {
    if (!stats.utilizationPercentage) return 0;
    const percentages = Object.values(stats.utilizationPercentage) as number[];
    if (percentages.length === 0) return 0;
    const sum = percentages.reduce((a, b) => a + b, 0);
    return Math.round(sum / percentages.length);
  }

  testClick(): void {
    console.log('🎯 TEST BUTTON CLICKED!');
    alert('Test button works! Click events are functioning.');
    console.log('Users:', this.users);
    console.log('First user:', this.users[0]);
  }

  changeRole(user: any, role: string): void {
    this.userService.updateUserRole(user.id, role).subscribe({
      next: () => {
        Swal.fire('Updated', `${user.fullname} is now ${role}`, 'success');
        this.fetchUsers();
      },
      error: (err) => Swal.fire('Error', err.error?.message || 'Update failed', 'error')
    });
  }

  viewQuota(userId: number): void {
    console.log('🔥 VIEW QUOTA CLICKED! User ID:', userId);
    alert('View Quota button clicked! User ID: ' + userId);

    if (!userId) {
      Swal.fire('Error', 'Invalid user ID', 'error');
      return;
    }

    this.loadingQuota = true;
    console.log('=== Fetching quota for user ID:', userId);

    // Show loading toast
    Swal.fire({
      title: 'Loading...',
      text: 'Fetching quota details',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.quotaService.getAdminQuotaDetails(userId).subscribe({
      next: (data) => {
        console.log('=== Received quota data:', data);
        Swal.close();

        if (!data || !data.user || !data.quota) {
          console.error('Invalid data structure:', data);
          Swal.fire('Error', 'Invalid quota data received from server', 'error');
          this.loadingQuota = false;
          return;
        }

        // Set selected user and quota
        this.selectedUser = data.user;
        this.selectedQuota = data.quota;
        this.selectedPlan = data.user.subscriptionTier || 'free';

        // Populate custom quotas with current values
        this.customQuotas = {
          maxUploads: data.quota.maxUploads || 0,
          summaries: data.quota.summaries || 0,
          flashcards: data.quota.flashcards || 0,
          quizzes: data.quota.quizzes || 0,
          chats: data.quota.chats || 0,
          studyPlans: data.quota.studyPlans || 0
        };

        // Populate used quotas
        this.usedQuotas = {
          usedUploads: data.quota.usedUploads || 0,
          usedSummaries: data.quota.usedSummaries || 0,
          usedFlashcards: data.quota.usedFlashcards || 0,
          usedQuizzes: data.quota.usedQuizzes || 0,
          usedChats: data.quota.usedChats || 0,
          usedStudyPlans: data.quota.usedStudyPlans || 0
        };

        console.log('=== Selected user:', this.selectedUser);
        console.log('=== Selected quota:', this.selectedQuota);
        console.log('=== Custom quotas:', this.customQuotas);

        this.loadingQuota = false;

        // Scroll to the quota editor with a slight delay
        setTimeout(() => {
          const element = document.querySelector('.quota-editor-section');
          if (element) {
            console.log('=== Scrolling to quota editor');
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            console.error('=== Quota editor element not found in DOM');
          }
        }, 200);
      },
      error: (err) => {
        Swal.close();
        console.error('=== Error fetching quota:', err);
        console.error('=== Error details:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message
        });

        let errorMsg = 'Cannot load quota details';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.status === 404) {
          errorMsg = 'User or quota not found';
        } else if (err.status === 401 || err.status === 403) {
          errorMsg = 'Not authorized to view quota';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error Loading Quota',
          text: errorMsg,
          footer: `Status: ${err.status} - Check browser console for details`
        });

        this.loadingQuota = false;
      }
    });
  }

  applySubscriptionPlan(): void {
    if (!this.selectedUser) return;

    Swal.fire({
      title: 'Apply Subscription Plan?',
      text: `Apply ${this.selectedPlan} plan to ${this.selectedUser.fullname}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Apply',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.quotaService.applySubscriptionPlan(this.selectedUser.id, {
          plan: this.selectedPlan as any,
          resetUsage: false
        }).subscribe({
          next: (res) => {
            Swal.fire('Success', res.message, 'success');
            this.viewQuota(this.selectedUser.id);
          },
          error: (err) => Swal.fire('Error', err.error?.message || 'Failed to apply plan', 'error')
        });
      }
    });
  }

  applyCustomQuotas(): void {
    if (!this.selectedUser) return;

    Swal.fire({
      title: 'Apply Custom Quotas?',
      text: `Apply custom quota settings to ${this.selectedUser.fullname}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Apply',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.quotaService.customizeUserQuota(this.selectedUser.id, {
          ...this.customQuotas,
          ...this.usedQuotas
        }).subscribe({
          next: (res) => {
            Swal.fire('Success', res.message, 'success');
            this.viewQuota(this.selectedUser.id);
          },
          error: (err) => Swal.fire('Error', err.error?.message || 'Failed to customize quota', 'error')
        });
      }
    });
  }

  resetUserQuota(): void {
    if (!this.selectedUser) return;

    Swal.fire({
      title: 'Reset Quota Usage?',
      text: `Reset all usage counters for ${this.selectedUser.fullname}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reset',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.quotaService.resetUserQuota(this.selectedUser.id).subscribe({
          next: (res) => {
            Swal.fire('Success', res.message, 'success');
            this.viewQuota(this.selectedUser.id);
          },
          error: (err) => Swal.fire('Error', err.error?.message || 'Failed to reset quota', 'error')
        });
      }
    });
  }

  closeQuotaEditor(): void {
    this.selectedUser = null;
    this.selectedQuota = null;
  }

  saveQuotaChanges(data: any): void {
    this.quotaService.updateQuota(data.userId, data).subscribe({
      next: () => Swal.fire('✅ Success', 'Quota updated successfully', 'success'),
      error: () => Swal.fire('Error', 'Failed to update quota', 'error')
    });
  }

  logout(): void {
    this.router.navigate(['/logout']);
  }
}
