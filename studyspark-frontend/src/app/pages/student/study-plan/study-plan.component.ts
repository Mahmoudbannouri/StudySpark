import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { PreferencesModalComponent, Preferences } from './preference-modal.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
interface Document {
  id: number;
  name: string;
  selected: boolean;
}

interface Task {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  type: 'read' | 'review' | 'practice' | 'quiz';
  completed: boolean;
}

interface StudyPlan {
  documents: string[];
  duration: number;
  dailyHours: number;
  tasks: Task[];
}

@Component({
  selector: 'app-study-plan',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, PreferencesModalComponent, FullCalendarModule],
  templateUrl: './study-plan.component.html',
  styleUrls: ['./study-plan.component.scss']
})
export class StudyPlanComponent implements OnInit {
  user: any = null;
  showPreferencesModal = false;
  userPreferences: Preferences | null = null;

  availableDocuments: Document[] = [
    { id: 1, name: 'Introduction to ML.pdf', selected: false },
    { id: 2, name: 'Data Structures.pdf', selected: false },
    { id: 3, name: 'Physics Notes.pdf', selected: false },
    { id: 4, name: 'Calculus.pdf', selected: false },
  ];

  studyDuration = 2; // weeks
  dailyHours = 2;

  currentPlan: StudyPlan | null = null;

  calendarOptions: CalendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  editable: false,
  selectable: true,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek'
  },
  events: [],
  allDaySlot: false,
  slotMinTime: '00:00:00',   // start at midnight
  slotMaxTime: '24:00:00',   // end at midnight
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




  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
    this.generateFakePlan(); // Demo with fake events
  }

  openPreferences() { this.showPreferencesModal = true; }
  closePreferences() { this.showPreferencesModal = false; }
  savePreferences(prefs: Preferences) { 
    this.userPreferences = prefs;
    this.showPreferencesModal = false;
  }

  canGeneratePlan(): boolean {
    return this.availableDocuments.some(d => d.selected) && this.dailyHours > 0 && this.studyDuration > 0;
  }

  generateFakePlan() {
    const today = new Date();
    const tasks: Task[] = [];

    for (let i = 0; i < 10; i++) {
      const start = new Date(today);
      start.setDate(today.getDate() + i);
      start.setHours(9 + (i % 4), 0, 0, 0);

      const end = new Date(start);
      end.setHours(start.getHours() + 1);

      const types: Task['type'][] = ['read', 'review', 'practice', 'quiz'];
      const type = types[i % types.length];

      tasks.push({
        id: i,
        title: `Task ${i + 1}`,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        type,
        completed: false
      });
    }

    this.currentPlan = {
      documents: ['Introduction to ML.pdf', 'Data Structures.pdf'],
      duration: 2,
      dailyHours: 2,
      tasks
    };

    this.loadTasksIntoCalendar();
  }

  loadTasksIntoCalendar() {
    if (!this.currentPlan) return;

    const events: EventInput[] = this.currentPlan.tasks.map(task => {
      let color = '';
      switch(task.type) {
        case 'read': color = '#3b82f6'; break;
        case 'review': color = '#f59e0b'; break;
        case 'practice': color = '#10b981'; break;
        case 'quiz': color = '#ec4899'; break;
      }
      return {
        title: task.title,
        start: task.startTime,
        end: task.endTime,
        backgroundColor: color,
        borderColor: color
      };
    });

    this.calendarOptions.events = events;
  }

  createNewPlan(): void {
    this.currentPlan = null;
    this.availableDocuments.forEach(d => d.selected = false);
  }
}
