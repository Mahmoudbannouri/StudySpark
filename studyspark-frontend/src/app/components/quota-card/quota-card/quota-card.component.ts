import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import gsap from 'gsap';

@Component({
  selector: 'app-quota-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quota-card.component.html',
  styleUrls: ['./quota-card.component.scss']
})
export class QuotaCardComponent implements OnInit {
  @Input() quota: any;
  @Input() editable = false;
  @Output() save = new EventEmitter<any>();

  localQuota: any = {};

  ngOnInit(): void {
    this.localQuota = { ...this.quota };
    gsap.from('.quota-card', { opacity: 0, y: 30, duration: 0.8, ease: 'power2.out' });
  }

  saveChanges(): void {
    this.save.emit(this.localQuota);
  }
}
