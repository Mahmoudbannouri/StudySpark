import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // ✅ ADD RouterModule
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import gsap from 'gsap';
import { showToast } from '../../../toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule], // ✅ ADD RouterModule
  templateUrl: './register.component.html',
  styleUrls: ['../auth-styles.scss']
})
export class RegisterComponent implements AfterViewInit {
  fullname = '';
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router, private el: ElementRef) {}

  ngAfterViewInit() {
    // Simple fade in animation
    const card = this.el.nativeElement.querySelector('.auth-card');
    if (card) {
      gsap.fromTo(card,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
    }

    // Floating shapes animation
    const shapes = this.el.nativeElement.querySelectorAll('.floating-shape');
    if (shapes.length > 0) {
      gsap.to(shapes, {
        y: 20,
        repeat: -1,
        yoyo: true,
        duration: 2,
        ease: 'sine.inOut'
      });
    }
  }
  onRegister(): void {
    this.auth.register({
      fullname: this.fullname,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        showToast('🎉 Registration successful!', 'success');
        this.router.navigateByUrl('/login');
      },
      error: (err) => showToast(err.error?.message || 'Registration failed', 'error')
    });
  }
}
