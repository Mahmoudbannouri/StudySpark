import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { PreferencesModalComponent, Preferences } from './preference-modal.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { StudyPlanService, StudyPlan as StudyPlanInterface } from '../../../services/studyPlan.service';
import { AuthService } from '../../../services/auth.service';
import { DocumentService } from '../../../services/document.service';
interface Document {
  id: number;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-study-plan',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, PreferencesModalComponent, FullCalendarModule],
  templateUrl: './study-plan.component.html',
  styleUrls: ['./study-plan.component.scss']
})
export class StudyPlanComponent implements OnInit {
  generating = false;
  user: any = null;
  showPreferencesModal = false;
  userPreferences: Preferences | null = null;
  availableDocuments: Document[] = [];

  currentPlan: StudyPlanInterface | null = null;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    editable: false,
    selectable: true,
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' },
    events: [],
    allDaySlot: false,
    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',
    eventDidMount: (info) => {
      const start = info.event.start?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const end = info.event.end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      info.el.setAttribute('title', `${start} - ${end}`);
      info.el.style.cursor = 'pointer';
      info.el.style.borderRadius = '6px';
      info.el.style.padding = '2px 4px';
      info.el.style.fontSize = '0.85rem';
      info.el.style.backgroundColor = '#667eea';
      info.el.style.color = 'white';
    },
    eventMouseEnter: (info) => { info.el.style.backgroundColor = '#5a67d8'; },
    eventMouseLeave: (info) => { info.el.style.backgroundColor = '#667eea'; },
    dateClick: (info) => console.log('Date clicked:', info.dateStr),
  };

  constructor(
    private auth: AuthService,
    private studyPlanService: StudyPlanService,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
    this.loadAvailableDocuments();
    this.fetchStudyPlan();
    this.loadTasksIntoCalendar()
  }

  loadAvailableDocuments() {
    // ✅ Fetch documents from backend instead of hardcoded
    this.documentService.getUserDocuments().subscribe({
      next: (docs) => {
        this.availableDocuments = docs.map(d => ({
          id: d.id,
          name: d.name,
          selected: false
        }));

        // Mark selected documents if there is already a plan
        if (this.currentPlan?.documents) {
          this.availableDocuments.forEach(doc => {
            doc.selected = this.currentPlan!.documents.includes(doc.id);
          });
        }
      },
      error: (err) => console.error('Failed to load documents', err)
    });
  }

  openPreferences() { this.showPreferencesModal = true; }
  closePreferences() { this.showPreferencesModal = false; }

  savePreferences(prefs: Preferences) {
    this.userPreferences = prefs;
    
    
  }

  generatePlan(prefs: Preferences) {
  this.userPreferences = prefs;

  const payload = {
    documentsIds: prefs.documents.map(d => d.id),
    freeDays: prefs.freeDays,
    dailyHours: prefs.dailyHours,
    sessionDuration: prefs.sessionDuration,
    examDates: prefs.documents
      .filter(d => d.examDate)
      .reduce((acc, d) => ({ ...acc, [d.id]: d.examDate }), {})
  };

  this.generating = true;
  console.log('Sending payload:', payload);

  this.studyPlanService.createOrUpdateStudyPlan(payload).subscribe({
    next: (plan) => {
      console.log('✅ Study plan created:', plan);
      this.currentPlan = plan;
      this.loadTasksIntoCalendar();
      this.showPreferencesModal = false;
      this.generating = false;
    },
    error: (err) => {
      console.error('Failed to generate study plan', err);
      this.generating = false;
    }
  });
}



  fetchStudyPlan() {
  this.studyPlanService.getStudyPlan().subscribe({
    next: (plan) => {
      // Parse JSON fields coming as strings from DB
      try {
        if (typeof plan.tasks === 'string') plan.tasks = JSON.parse(plan.tasks);
        if (typeof plan.documents === 'string') plan.documents = JSON.parse(plan.documents);
        if (typeof plan.freeDays === 'string') plan.freeDays = JSON.parse(plan.freeDays);
        if (typeof plan.dailyHours === 'string') plan.dailyHours = JSON.parse(plan.dailyHours);
      } catch (error) {
        console.error('Failed to parse study plan JSON fields', error);
        plan.tasks = [];
        plan.documents = [];
        plan.freeDays = [];
        plan.dailyHours = {};
      }

      console.log('Tasks in plan:', plan.tasks); // <- check if tasks are now array

      this.currentPlan = plan;

      // Mark selected documents in preferences
      this.availableDocuments.forEach(doc => {
        doc.selected = plan.documents.includes(doc.id);
      });

      // Load tasks into calendar
      this.loadTasksIntoCalendar();
    },
    error: (err) => console.log('No existing study plan', err)
  });
}

  loadTasksIntoCalendar() {
  if (!this.currentPlan) return;

  const events: EventInput[] = this.currentPlan.tasks.map(task => {
    // Convert date + time to start/end ISO strings
    const [startHour, endHour] = task.time.split('-');
    const startTime = `${task.date}T${startHour}:00.000Z`;
    const endTime = `${task.date}T${endHour}:00.000Z`;

    // Create a title for calendar
    const title = `${task.subject}: ${task.topic}`;

    // Assign a type (optional, default to 'study')
    const type = 'study';

    // Choose color based on type
    
    return {
      title,
      start: startTime,
      end: endTime,
     
    };
  });

  // Feed to your calendar library
  this.calendarOptions.events = events;
}




  createNewPlan(): void {
    this.currentPlan = null;
    this.availableDocuments.forEach(d => d.selected = false);
    this.userPreferences = null;
  }
}
