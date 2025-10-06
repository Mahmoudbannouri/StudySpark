import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { QuotaService } from '../../../services/quota.service';
import { QuotaCardComponent } from '../../../components/quota-card/quota-card/quota-card.component';
import Swal from 'sweetalert2';
import gsap from 'gsap';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, QuotaCardComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
  user: any;
  quota: any;

  constructor(
    private auth: AuthService,
    private quotaService: QuotaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
    gsap.from('.dashboard-container', { opacity: 0, y: 40, duration: 1 });
    this.loadQuota();
  }

  loadQuota(): void {
    this.quotaService.getMyQuota().subscribe({
      next: (data) => (this.quota = data),
      error: () => Swal.fire('Error', 'Could not load quota', 'error')
    });
  }

  logout(): void {
    this.router.navigate(['/logout']);
  }
}
