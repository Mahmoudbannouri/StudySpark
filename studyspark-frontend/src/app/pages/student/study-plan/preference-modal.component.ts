import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface StudyDocument {
  id: number;
  name: string;
  selected: boolean;
  examDate?: string;
}

export interface Preferences {
  freeDays: string[];
  dailyHours: { [day: string]: string };
  sessionDuration: number;
  documents: StudyDocument[];
}

@Component({
  selector: 'app-preferences-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preference-modal.component.html',
  styleUrls: ['./preference-modal.component.scss']
})
export class PreferencesModalComponent {
  @Input() show = false;
  @Input() availableDocuments: StudyDocument[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Preferences>();
  @Output() generate = new EventEmitter<Preferences>();
generating = false;

canGeneratePlan() {
  // Check if user has selected at least one document
  return this.preferences.documents.length > 0;
}

generatePlan() {
  if (!this.canGeneratePlan()) return;

  this.generating = true;
  this.generate.emit(this.preferences);
}

  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  preferences: Preferences = {
    freeDays: [],
    dailyHours: {},
    sessionDuration: 1,
    documents: []
  };

  // ✅ Add this method to initialize preferences.documents when modal opens
  ngOnChanges() {
    if (this.show) {
      this.preferences.documents = this.availableDocuments
        .filter(d => d.selected)
        .map(d => ({ ...d })); // clone to avoid mutating original array
    }
  }

  toggleDay(day: string) {
    const index = this.preferences.freeDays.indexOf(day);
    if (index > -1) this.preferences.freeDays.splice(index, 1);
    else this.preferences.freeDays.push(day);
  }

  toggleDocument(doc: StudyDocument) {
  // Keep the selection in sync
  if (doc.selected) {
    // If already in preferences.documents, keep it
    if (!this.preferences.documents.some(d => d.id === doc.id)) {
      // Clone the object for exam date tracking
      this.preferences.documents.push({ ...doc });
    }
  } else {
    // Remove from preferences.documents when unchecked
    this.preferences.documents = this.preferences.documents.filter(d => d.id !== doc.id);
  }
}


  handleSave() {
    this.save.emit(this.preferences);
  }

  handleClose() {
    this.close.emit();
  }
}

