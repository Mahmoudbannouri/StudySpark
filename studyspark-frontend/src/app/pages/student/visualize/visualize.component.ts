import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';

interface Dataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

interface Visualization {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'radar';
  title: string;
  data: ChartData;
  description: string;
  insights: string[];
}

interface Document {
  id: string;
  name: string;
}

@Component({
  selector: 'app-visualize',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './visualize.component.html',
  styleUrls: ['./visualize.component.scss']
})
export class VisualizeComponent implements OnInit {
  user = {
    name: 'Sarah Johnson',
    role: 'Student',
    avatar: 'assets/avatar.jpg'
  };

  availableDocuments: Document[] = [
    { id: '1', name: 'Q1 Study Progress Report.pdf' },
    { id: '2', name: 'Course Performance Data.xlsx' },
    { id: '3', name: 'Learning Analytics Dashboard.csv' },
    { id: '4', name: 'Semester Study Hours.pdf' }
  ];

  selectedDocumentId: string = '';
  generating: boolean = false;
  visualizations: Visualization[] = [];
  selectedVisualization: Visualization | null = null;

  visualizationTypes = {
    progress: true,
    distribution: true,
    comparison: true,
    timeline: true
  };

  ngOnInit(): void {
    // Initialize with sample visualizations
    this.createMockCharts();
  }

  generateVisualizations(): void {
    if (!this.selectedDocumentId) {
      return;
    }

    this.generating = true;
    this.visualizations = [];
    this.selectedVisualization = null;

    // Simulate API call
    setTimeout(() => {
      this.createMockCharts();
      this.generating = false;
    }, 2000);
  }

  createMockCharts(): void {
    this.visualizations = [];

    if (this.visualizationTypes.progress) {
      this.visualizations.push({
        id: 'progress-line',
        type: 'line',
        title: 'Learning Progress Over Time',
        description: 'Track your study progress across different weeks',
        insights: [
          'Steady improvement observed from Week 1 to Week 8',
          'Highest performance in Week 6 with 92% completion',
          'Slight dip in Week 4 may indicate challenging topics',
          'Overall trend shows consistent growth'
        ],
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
          datasets: [
            {
              label: 'Quiz Scores (%)',
              data: [65, 72, 78, 68, 85, 92, 88, 90],
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4
            },
            {
              label: 'Assignment Scores (%)',
              data: [70, 75, 80, 73, 82, 88, 90, 93],
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4
            }
          ]
        }
      });
    }

    if (this.visualizationTypes.distribution) {
      this.visualizations.push({
        id: 'topic-pie',
        type: 'pie',
        title: 'Study Time Distribution by Topic',
        description: 'Breakdown of time spent on different subjects',
        insights: [
          'Mathematics receives the most study time at 30%',
          'Computer Science and Physics are equally prioritized',
          'Chemistry might need more attention at only 15%',
          'Well-balanced distribution across major subjects'
        ],
        data: {
          labels: ['Mathematics', 'Computer Science', 'Physics', 'Chemistry', 'English'],
          datasets: [
            {
              label: 'Study Hours',
              data: [30, 25, 25, 15, 5],
              backgroundColor: [
                '#6366f1',
                '#8b5cf6',
                '#a855f7',
                '#ec4899',
                '#f59e0b'
              ],
              borderWidth: 2
            }
          ]
        }
      });
    }

    if (this.visualizationTypes.comparison) {
      this.visualizations.push({
        id: 'skills-radar',
        type: 'radar',
        title: 'Skills Assessment Radar',
        description: 'Compare your proficiency across different skill areas',
        insights: [
          'Strongest skills: Problem Solving and Critical Thinking',
          'Areas for improvement: Time Management and Communication',
          'Technical Skills show excellent progress',
          'Balanced development across most categories'
        ],
        data: {
          labels: ['Problem Solving', 'Critical Thinking', 'Technical Skills', 'Communication', 'Time Management', 'Creativity'],
          datasets: [
            {
              label: 'Current Level',
              data: [90, 85, 88, 70, 65, 80],
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              borderColor: '#6366f1',
              borderWidth: 2
            },
            {
              label: 'Target Level',
              data: [95, 90, 95, 85, 90, 88],
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              borderColor: '#8b5cf6',
              borderWidth: 2
            }
          ]
        }
      });
    }

    if (this.visualizationTypes.timeline) {
      this.visualizations.push({
        id: 'study-hours-bar',
        type: 'bar',
        title: 'Weekly Study Hours by Subject',
        description: 'Detailed breakdown of study time allocation',
        insights: [
          'Peak study hours in Computer Science this week',
          'Consistent study pattern maintained across subjects',
          'Mathematics study time increased by 20%',
          'Total weekly study time: 28 hours'
        ],
        data: {
          labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          datasets: [
            {
              label: 'Mathematics',
              data: [2, 1.5, 2, 1, 2.5, 3, 2],
              backgroundColor: '#6366f1'
            },
            {
              label: 'Computer Science',
              data: [1.5, 2, 2.5, 2, 2, 2.5, 3],
              backgroundColor: '#8b5cf6'
            },
            {
              label: 'Physics',
              data: [1, 1, 1.5, 1.5, 1, 2, 1.5],
              backgroundColor: '#a855f7'
            }
          ]
        }
      });
    }

    if (this.visualizations.length > 0) {
      this.selectedVisualization = this.visualizations[0];
    }
  }

  selectChart(visualization: Visualization): void {
    this.selectedVisualization = visualization;
  }

  changeChartType(type: 'bar' | 'line' | 'pie' | 'radar'): void {
    if (this.selectedVisualization) {
      this.selectedVisualization = { ...this.selectedVisualization, type };
    }
  }

  downloadChart(format: 'png' | 'pdf' | 'csv'): void {
    alert(`Downloading chart as ${format.toUpperCase()}... (Feature to be implemented)`);
  }

  resetView(): void {
    if (this.visualizations.length > 0) {
      this.selectedVisualization = this.visualizations[0];
    }
  }

  getChartHeight(type: string): number {
    switch (type) {
      case 'bar':
      case 'line':
        return 300;
      case 'pie':
        return 350;
      case 'radar':
        return 350;
      default:
        return 300;
    }
  }

  getDataTableRows(): any[] {
    if (!this.selectedVisualization) return [];

    const { labels, datasets } = this.selectedVisualization.data;
    const rows = [];

    for (let i = 0; i < labels.length; i++) {
      const row: any = { label: labels[i] };
      datasets.forEach(dataset => {
        row[dataset.label] = dataset.data[i];
      });
      rows.push(row);
    }

    return rows;
  }

  getDataTableColumns(): string[] {
    if (!this.selectedVisualization) return [];
    return this.selectedVisualization.data.datasets.map(d => d.label);
  }

  calculateTotal(column: string): number {
    if (!this.selectedVisualization) return 0;

    const dataset = this.selectedVisualization.data.datasets.find(d => d.label === column);
    if (!dataset) return 0;

    return dataset.data.reduce((sum, val) => sum + val, 0);
  }

  calculateAverage(column: string): number {
    if (!this.selectedVisualization) return 0;

    const dataset = this.selectedVisualization.data.datasets.find(d => d.label === column);
    if (!dataset || dataset.data.length === 0) return 0;

    const total = dataset.data.reduce((sum, val) => sum + val, 0);
    return total / dataset.data.length;
  }

  // SVG Drawing Methods
  getBarChartBars(): any[] {
    if (!this.selectedVisualization || this.selectedVisualization.type !== 'bar') return [];

    const { labels, datasets } = this.selectedVisualization.data;
    const bars: any[] = [];
    const chartWidth = 800;
    const chartHeight = 300;
    const padding = 40;
    const barGroupWidth = (chartWidth - 2 * padding) / labels.length;
    const barWidth = barGroupWidth / datasets.length - 5;

    const maxValue = Math.max(...datasets.flatMap(d => d.data));
    const scale = (chartHeight - 2 * padding) / maxValue;

    labels.forEach((label, labelIndex) => {
      datasets.forEach((dataset, datasetIndex) => {
        const value = dataset.data[labelIndex];
        const height = value * scale;
        const x = padding + labelIndex * barGroupWidth + datasetIndex * (barWidth + 5);
        const y = chartHeight - padding - height;

        bars.push({
          x,
          y,
          width: barWidth,
          height,
          color: dataset.backgroundColor,
          value,
          label: dataset.label
        });
      });
    });

    return bars;
  }

  getLineChartPaths(): any[] {
    if (!this.selectedVisualization || this.selectedVisualization.type !== 'line') return [];

    const { labels, datasets } = this.selectedVisualization.data;
    const paths: any[] = [];
    const chartWidth = 800;
    const chartHeight = 300;
    const padding = 40;

    const pointSpacing = (chartWidth - 2 * padding) / (labels.length - 1);
    const maxValue = Math.max(...datasets.flatMap(d => d.data));
    const scale = (chartHeight - 2 * padding) / maxValue;

    datasets.forEach(dataset => {
      let pathData = '';
      const points: any[] = [];

      dataset.data.forEach((value, index) => {
        const x = padding + index * pointSpacing;
        const y = chartHeight - padding - value * scale;

        if (index === 0) {
          pathData += `M ${x} ${y}`;
        } else {
          pathData += ` L ${x} ${y}`;
        }

        points.push({ x, y, value });
      });

      paths.push({
        path: pathData,
        color: dataset.borderColor,
        label: dataset.label,
        points
      });
    });

    return paths;
  }

  getPieChartSlices(): any[] {
    if (!this.selectedVisualization || this.selectedVisualization.type !== 'pie') return [];

    const dataset = this.selectedVisualization.data.datasets[0];
    const total = dataset.data.reduce((sum, val) => sum + val, 0);
    const slices: any[] = [];
    const centerX = 200;
    const centerY = 175;
    const radius = 120;

    let startAngle = -90;

    dataset.data.forEach((value, index) => {
      const percentage = (value / total) * 100;
      const angle = (value / total) * 360;
      const endAngle = startAngle + angle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      const labelAngle = startAngle + angle / 2;
      const labelRad = (labelAngle * Math.PI) / 180;
      const labelX = centerX + (radius * 0.7) * Math.cos(labelRad);
      const labelY = centerY + (radius * 0.7) * Math.sin(labelRad);

      slices.push({
        path: pathData,
        color: Array.isArray(dataset.backgroundColor)
          ? dataset.backgroundColor[index]
          : dataset.backgroundColor,
        label: this.selectedVisualization?.data.labels[index] || '',
        value,
        percentage: percentage.toFixed(1),
        labelX,
        labelY
      });

      startAngle = endAngle;
    });

    return slices;
  }

  getRadarChartPaths(): any[] {
    if (!this.selectedVisualization || this.selectedVisualization.type !== 'radar') return [];

    const { labels, datasets } = this.selectedVisualization.data;
    const paths: any[] = [];
    const centerX = 200;
    const centerY = 175;
    const maxRadius = 140;
    const angleStep = (2 * Math.PI) / labels.length;

    const maxValue = 100; // Assuming radar values are 0-100

    // Draw background web
    const webLevels = 5;
    const webPaths: any[] = [];

    for (let level = 1; level <= webLevels; level++) {
      const radius = (maxRadius / webLevels) * level;
      let webPath = '';

      for (let i = 0; i <= labels.length; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        if (i === 0) {
          webPath += `M ${x} ${y}`;
        } else {
          webPath += ` L ${x} ${y}`;
        }
      }

      webPaths.push({ path: webPath, level });
    }

    // Draw axes
    const axesPaths: any[] = [];
    labels.forEach((label, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + maxRadius * Math.cos(angle);
      const y = centerY + maxRadius * Math.sin(angle);
      const labelX = centerX + (maxRadius + 30) * Math.cos(angle);
      const labelY = centerY + (maxRadius + 30) * Math.sin(angle);

      axesPaths.push({
        path: `M ${centerX} ${centerY} L ${x} ${y}`,
        label,
        labelX,
        labelY
      });
    });

    // Draw data
    datasets.forEach(dataset => {
      let dataPath = '';
      const points: any[] = [];

      dataset.data.forEach((value, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const radius = (value / maxValue) * maxRadius;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        if (index === 0) {
          dataPath += `M ${x} ${y}`;
        } else {
          dataPath += ` L ${x} ${y}`;
        }

        points.push({ x, y, value });
      });

      dataPath += ' Z';

      paths.push({
        path: dataPath,
        color: dataset.borderColor,
        fillColor: dataset.backgroundColor,
        label: dataset.label,
        points,
        webPaths,
        axesPaths
      });
    });

    return paths;
  }
}
