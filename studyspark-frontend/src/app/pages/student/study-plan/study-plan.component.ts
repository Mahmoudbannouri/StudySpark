import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { AuthService } from '../../../services/auth.service';

interface Document {
  id: number;
  name: string;
  selected: boolean;
}

interface Task {
  id: number;
  title: string;
  duration: string;
  type: string;
  completed: boolean;
}

interface Day {
  dayName: string;
  date: Date;
  tasks: Task[];
}

interface Week {
  days: Day[];
}

interface StudyPlan {
  documents: string[];
  duration: number;
  dailyHours: number;
  examDate?: string;
  weeks: Week[];
}

@Component({
  selector: 'app-study-plan',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './study-plan.component.html',
  styleUrls: ['./study-plan.component.scss']
})
export class StudyPlanComponent implements OnInit {
  user: any = null;
  generating = false;

  // Form fields
  availableDocuments: Document[] = [
    { id: 1, name: 'Introduction to Machine Learning.pdf', selected: false },
    { id: 2, name: 'Data Structures Chapter 3.pdf', selected: false },
    { id: 3, name: 'Physics Lecture Notes.pdf', selected: false },
    { id: 4, name: 'Calculus Fundamentals.pdf', selected: false },
  ];

  studyDuration: number = 2;
  dailyHours: number = 2;
  examDate: string = '';

  // Current plan
  currentPlan: StudyPlan | null = null;
  selectedWeek = 0;

  // Progress stats
  completedTasks = 0;
  totalTasks = 0;
  studiedHours = 0;
  progressPercentage = 0;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
  }

  canGeneratePlan(): boolean {
    return this.availableDocuments.some(doc => doc.selected) &&
           this.dailyHours > 0 &&
           this.studyDuration > 0;
  }

  generateStudyPlan(): void {
    this.generating = true;

    // Simulate AI generation
    setTimeout(() => {
      const selectedDocs = this.availableDocuments
        .filter(doc => doc.selected)
        .map(doc => doc.name);

      this.currentPlan = this.createMockPlan(selectedDocs);
      this.calculateProgress();
      this.generating = false;
    }, 2000);
  }

  createMockPlan(documents: string[]): StudyPlan {
    const weeks: Week[] = [];
    const startDate = new Date();
    const taskTypes = ['read', 'review', 'practice', 'quiz'];

    for (let weekNum = 0; weekNum < this.studyDuration; weekNum++) {
      const days: Day[] = [];

      for (let dayNum = 0; dayNum < 7; dayNum++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (weekNum * 7) + dayNum);

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const tasks: Task[] = [];

        // Rest on Sundays
        if (dayNum !== 0) {
          const numTasks = Math.min(documents.length, Math.floor(Math.random() * 2) + 2);

          for (let taskNum = 0; taskNum < numTasks; taskNum++) {
            const doc = documents[taskNum % documents.length];
            const type = taskTypes[Math.floor(Math.random() * taskTypes.length)];

            tasks.push({
              id: weekNum * 100 + dayNum * 10 + taskNum,
              title: `${this.capitalize(type)}: ${doc}`,
              duration: `${Math.floor(this.dailyHours / numTasks * 60)}min`,
              type: type,
              completed: Math.random() > 0.7 // Randomly complete some tasks for demo
            });
          }
        }

        days.push({
          dayName: dayNames[dayNum],
          date: currentDate,
          tasks: tasks
        });
      }

      weeks.push({ days });
    }

    return {
      documents,
      duration: this.studyDuration,
      dailyHours: this.dailyHours,
      examDate: this.examDate,
      weeks
    };
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  calculateProgress(): void {
    if (!this.currentPlan) return;

    let completed = 0;
    let total = 0;
    let hours = 0;

    this.currentPlan.weeks.forEach(week => {
      week.days.forEach(day => {
        day.tasks.forEach(task => {
          total++;
          if (task.completed) {
            completed++;
            // Extract hours from duration string
            const durationMatch = task.duration.match(/(\d+)/);
            if (durationMatch) {
              hours += parseInt(durationMatch[1]) / 60;
            }
          }
        });
      });
    });

    this.completedTasks = completed;
    this.totalTasks = total;
    this.studiedHours = Math.round(hours * 10) / 10;
    this.progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  selectWeek(index: number): void {
    this.selectedWeek = index;
  }

  updateTaskStatus(task: Task): void {
    this.calculateProgress();
  }

  createNewPlan(): void {
    this.currentPlan = null;
    this.selectedWeek = 0;
    this.availableDocuments.forEach(doc => doc.selected = false);
    this.studyDuration = 2;
    this.dailyHours = 2;
    this.examDate = '';
  }
}
