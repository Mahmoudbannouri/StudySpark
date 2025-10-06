import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { QuotaService } from '../../../services/quota.service';
import { QuotaCardComponent } from '../../../components/quota-card/quota-card/quota-card.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, QuotaCardComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  selectedQuota: any = null;
  loading = false;

  constructor(
    private userService: UserService,
    private quotaService: QuotaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (res) => (this.users = res),
      error: (err) => Swal.fire('Error', err.error?.message || 'Failed to load users', 'error'),
      complete: () => (this.loading = false)
    });
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
    this.quotaService.getAllQuotas().subscribe({
      next: (quotas) => {
        this.selectedQuota = quotas.find((q: any) => q.userId === userId);
        if (!this.selectedQuota) Swal.fire('Info', 'No quota found for user.', 'info');
      },
      error: () => Swal.fire('Error', 'Cannot load quota', 'error')
    });
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
