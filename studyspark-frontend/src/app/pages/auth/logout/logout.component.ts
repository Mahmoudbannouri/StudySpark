import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import gsap from 'gsap';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    gsap.from('.logout-card', { opacity: 0, scale: 0.9, duration: 0.6, ease: 'back.out' });
    setTimeout(() => {
      this.auth.logout();
      this.router.navigate(['/login']);
    }, 2000);
  }
}
