import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private titleService: Title) {
    this.setTitle('⚡ Study Spark');
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }
}
