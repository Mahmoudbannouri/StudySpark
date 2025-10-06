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
    gsap.from(this.el.nativeElement.querySelector('.auth-card'), {
      duration: 1.2,
      y: 40,
      opacity: 0,
      ease: 'power3.out'
    });
    gsap.to('.floating-shape', {
      y: 20,
      repeat: -1,
      yoyo: true,
      duration: 2,
      ease: 'sine.inOut'
    });
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
