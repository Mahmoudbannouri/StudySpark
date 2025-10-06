import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `<div class="loading">Redirecting...</div>`,
  styles: [`.loading { text-align:center; margin-top:50px; font-weight:bold; }`]
})
export class DashboardComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const user = this.auth.getUserInfo();
    if (user?.role === 'admin') this.router.navigate(['/admin']);
    else this.router.navigate(['/student']);
  }
}
