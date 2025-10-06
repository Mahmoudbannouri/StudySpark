import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { AuthService } from '../../services/auth.service';
import gsap from 'gsap';

@Component({
  selector: 'app-session-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-page.component.html',
  styleUrls: ['./session-page.component.scss']
})
export class SessionPageComponent implements OnInit {
  session: any;

  constructor(private sessionService: SessionService, private auth: AuthService) {}

  ngOnInit(): void {
    this.session = this.sessionService.getSessionDetails();
    gsap.from('.session-card', { opacity: 0, y: 30, duration: 0.8 });
  }

  logout() {
    this.auth.logout();
  }
}
