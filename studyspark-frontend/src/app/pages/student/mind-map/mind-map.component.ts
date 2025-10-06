import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';

interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  children: MindMapNode[];
  x: number;
  y: number;
  level: number;
  color: string;
  expanded: boolean;
  parent?: string;
}

interface Document {
  id: string;
  name: string;
}

@Component({
  selector: 'app-mind-map',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './mind-map.component.html',
  styleUrls: ['./mind-map.component.scss']
})
export class MindMapComponent implements OnInit {
  user = {
    name: 'Sarah Johnson',
    role: 'Student',
    avatar: 'assets/avatar.jpg'
  };

  availableDocuments: Document[] = [
    { id: '1', name: 'Introduction to Machine Learning.pdf' },
    { id: '2', name: 'Neural Networks Basics.pdf' },
    { id: '3', name: 'Deep Learning Course Notes.pdf' },
    { id: '4', name: 'Data Science Fundamentals.pdf' }
  ];

  selectedDocumentId: string = '';
  complexity: string = 'medium';
  generating: boolean = false;
  currentMindMap: MindMapNode | null = null;
  viewMode: 'tree' | 'radial' | 'force' = 'tree';
  selectedNode: MindMapNode | null = null;
  zoomLevel: number = 1;
  panX: number = 0;
  panY: number = 0;
  svgWidth: number = 1200;
  svgHeight: number = 800;

  ngOnInit(): void {
    // Initialize with a sample mind map
    this.createMockMindMap();
  }

  generateMindMap(): void {
    if (!this.selectedDocumentId) {
      return;
    }

    this.generating = true;
    this.selectedNode = null;

    // Simulate API call
    setTimeout(() => {
      this.createMockMindMap();
      this.generating = false;
    }, 2000);
  }

  createMockMindMap(): void {
    const rootNode: MindMapNode = {
      id: 'root',
      label: 'Machine Learning',
      description: 'A comprehensive overview of Machine Learning concepts, algorithms, and applications in modern AI systems.',
      children: [],
      x: 600,
      y: 400,
      level: 0,
      color: '#6366f1',
      expanded: true
    };

    // Level 1 - Main categories
    const supervisedLearning: MindMapNode = {
      id: 'supervised',
      label: 'Supervised Learning',
      description: 'Learning from labeled data where the algorithm learns to map inputs to known outputs.',
      children: [],
      x: 300,
      y: 200,
      level: 1,
      color: '#8b5cf6',
      expanded: true,
      parent: 'root'
    };

    const unsupervisedLearning: MindMapNode = {
      id: 'unsupervised',
      label: 'Unsupervised Learning',
      description: 'Finding patterns in data without labeled examples.',
      children: [],
      x: 600,
      y: 150,
      level: 1,
      color: '#8b5cf6',
      expanded: true,
      parent: 'root'
    };

    const reinforcementLearning: MindMapNode = {
      id: 'reinforcement',
      label: 'Reinforcement Learning',
      description: 'Learning through interaction with an environment to maximize rewards.',
      children: [],
      x: 900,
      y: 200,
      level: 1,
      color: '#8b5cf6',
      expanded: true,
      parent: 'root'
    };

    const neuralNetworks: MindMapNode = {
      id: 'neural',
      label: 'Neural Networks',
      description: 'Computing systems inspired by biological neural networks.',
      children: [],
      x: 750,
      y: 600,
      level: 1,
      color: '#8b5cf6',
      expanded: true,
      parent: 'root'
    };

    // Level 2 - Supervised Learning subcategories
    supervisedLearning.children = [
      {
        id: 'classification',
        label: 'Classification',
        description: 'Predicting discrete class labels.',
        children: [
          {
            id: 'logistic',
            label: 'Logistic Regression',
            description: 'Binary and multiclass classification using logistic function.',
            children: [],
            x: 150,
            y: 50,
            level: 3,
            color: '#ec4899',
            expanded: false,
            parent: 'classification'
          },
          {
            id: 'svm',
            label: 'Support Vector Machines',
            description: 'Finding optimal hyperplanes for classification.',
            children: [],
            x: 200,
            y: 100,
            level: 3,
            color: '#ec4899',
            expanded: false,
            parent: 'classification'
          },
          {
            id: 'decision-trees',
            label: 'Decision Trees',
            description: 'Tree-like model of decisions and their outcomes.',
            children: [],
            x: 250,
            y: 150,
            level: 3,
            color: '#ec4899',
            expanded: false,
            parent: 'classification'
          }
        ],
        x: 200,
        y: 100,
        level: 2,
        color: '#a855f7',
        expanded: true,
        parent: 'supervised'
      },
      {
        id: 'regression',
        label: 'Regression',
        description: 'Predicting continuous numerical values.',
        children: [
          {
            id: 'linear-reg',
            label: 'Linear Regression',
            description: 'Modeling relationship between variables using linear equation.',
            children: [],
            x: 350,
            y: 250,
            level: 3,
            color: '#ec4899',
            expanded: false,
            parent: 'regression'
          },
          {
            id: 'polynomial',
            label: 'Polynomial Regression',
            description: 'Non-linear relationships using polynomial functions.',
            children: [],
            x: 400,
            y: 300,
            level: 3,
            color: '#ec4899',
            expanded: false,
            parent: 'regression'
          }
        ],
        x: 350,
        y: 250,
        level: 2,
        color: '#a855f7',
        expanded: true,
        parent: 'supervised'
      }
    ];

    // Level 2 - Unsupervised Learning subcategories
    unsupervisedLearning.children = [
      {
        id: 'clustering',
        label: 'Clustering',
        description: 'Grouping similar data points together.',
        children: [
          {
            id: 'kmeans',
            label: 'K-Means',
            description: 'Partitioning data into K clusters based on centroids.',
            children: [],
            x: 500,
            y: 30,
            level: 3,
            color: '#ec4899',
            expanded: false,
            parent: 'clustering'
          },
          {
            id: 'hierarchical',
            label: 'Hierarchical Clustering',
            description: 'Building a hierarchy of clusters.',
            children: [],
            x: 550,
            y: 80,
            level: 3,
            color: '#ec4899',
            expanded: false,
            parent: 'clustering'
          }
        ],
        x: 520,
        y: 50,
        level: 2,
        color: '#a855f7',
        expanded: true,
        parent: 'unsupervised'
      },
      {
        id: 'dimensionality',
        label: 'Dimensionality Reduction',
        description: 'Reducing number of features while preserving information.',
        children: [
          {
            id: 'pca',
            label: 'PCA',
            description: 'Principal Component Analysis for feature extraction.',
            children: [],
            x: 680,
            y: 50,
            level: 3,
            color: '#ec4899',
            expanded: false,
            parent: 'dimensionality'
          }
        ],
        x: 680,
        y: 80,
        level: 2,
        color: '#a855f7',
        expanded: true,
        parent: 'unsupervised'
      }
    ];

    // Level 2 - Reinforcement Learning subcategories
    reinforcementLearning.children = [
      {
        id: 'q-learning',
        label: 'Q-Learning',
        description: 'Learning action-value function for optimal policy.',
        children: [],
        x: 850,
        y: 100,
        level: 2,
        color: '#a855f7',
        expanded: false,
        parent: 'reinforcement'
      },
      {
        id: 'policy-gradient',
        label: 'Policy Gradient',
        description: 'Directly optimizing the policy function.',
        children: [],
        x: 950,
        y: 150,
        level: 2,
        color: '#a855f7',
        expanded: false,
        parent: 'reinforcement'
      },
      {
        id: 'deep-rl',
        label: 'Deep RL',
        description: 'Combining deep learning with reinforcement learning.',
        children: [],
        x: 1000,
        y: 250,
        level: 2,
        color: '#a855f7',
        expanded: false,
        parent: 'reinforcement'
      }
    ];

    // Level 2 - Neural Networks subcategories
    neuralNetworks.children = [
      {
        id: 'cnn',
        label: 'Convolutional NN',
        description: 'Specialized for processing grid-like data such as images.',
        children: [
          {
            id: 'conv-layers',
            label: 'Convolution Layers',
            description: 'Feature extraction using learnable filters.',
            children: [],
            x: 600,
            y: 700,
            level: 3,
            color: '#ec4899',
            expanded: false,
            parent: 'cnn'
          },
          {
            id: 'pooling',
            label: 'Pooling Layers',
            description: 'Downsampling spatial dimensions.',
            children: [],
            x: 650,
            y: 750,
            level: 3,
            color: '#ec4899',
            expanded: false,
            parent: 'cnn'
          }
        ],
        x: 600,
        y: 680,
        level: 2,
        color: '#a855f7',
        expanded: true,
        parent: 'neural'
      },
      {
        id: 'rnn',
        label: 'Recurrent NN',
        description: 'Networks with loops for sequential data processing.',
        children: [
          {
            id: 'lstm',
            label: 'LSTM',
            description: 'Long Short-Term Memory for long-range dependencies.',
            children: [],
            x: 800,
            y: 700,
            level: 3,
            color: '#ec4899',
            expanded: false,
            parent: 'rnn'
          },
          {
            id: 'gru',
            label: 'GRU',
            description: 'Gated Recurrent Unit, simpler than LSTM.',
            children: [],
            x: 850,
            y: 750,
            level: 3,
            color: '#ec4899',
            expanded: false,
            parent: 'rnn'
          }
        ],
        x: 800,
        y: 680,
        level: 2,
        color: '#a855f7',
        expanded: true,
        parent: 'neural'
      },
      {
        id: 'transformer',
        label: 'Transformers',
        description: 'Attention-based architecture for sequence modeling.',
        children: [],
        x: 900,
        y: 600,
        level: 2,
        color: '#a855f7',
        expanded: false,
        parent: 'neural'
      }
    ];

    rootNode.children = [supervisedLearning, unsupervisedLearning, reinforcementLearning, neuralNetworks];

    this.currentMindMap = rootNode;
    this.calculatePositions();
  }

  calculatePositions(): void {
    if (!this.currentMindMap) return;

    // Recalculate positions based on view mode
    if (this.viewMode === 'tree') {
      this.calculateTreeLayout(this.currentMindMap);
    } else if (this.viewMode === 'radial') {
      this.calculateRadialLayout(this.currentMindMap);
    }
  }

  calculateTreeLayout(node: MindMapNode, x: number = 600, y: number = 400, angleStart: number = 0, angleEnd: number = 360): void {
    node.x = x;
    node.y = y;

    if (node.children.length === 0 || !node.expanded) return;

    const horizontalSpacing = 350;
    const verticalSpacing = 180;
    const childrenCount = node.children.length;

    node.children.forEach((child, index) => {
      if (node.level === 0) {
        // First level - spread around root
        const angle = (index * 90) - 45;
        const radius = 250;
        child.x = x + Math.cos(angle * Math.PI / 180) * radius;
        child.y = y + Math.sin(angle * Math.PI / 180) * radius;
      } else {
        // Subsequent levels
        const offsetY = (index - (childrenCount - 1) / 2) * verticalSpacing;
        child.x = x + (child.x < x ? -horizontalSpacing : horizontalSpacing);
        child.y = y + offsetY;
      }

      this.calculateTreeLayout(child, child.x, child.y, angleStart, angleEnd);
    });
  }

  calculateRadialLayout(node: MindMapNode, x: number = 600, y: number = 400, angle: number = 0, radius: number = 0): void {
    node.x = x + Math.cos(angle) * radius;
    node.y = y + Math.sin(angle) * radius;

    if (node.children.length === 0 || !node.expanded) return;

    const childRadius = radius + 200;
    const angleStep = (2 * Math.PI) / node.children.length;

    node.children.forEach((child, index) => {
      const childAngle = angle + (index * angleStep);
      this.calculateRadialLayout(child, x, y, childAngle, childRadius);
    });
  }

  selectNode(node: MindMapNode, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedNode = node;
  }

  expandNode(node: MindMapNode, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    node.expanded = true;
    this.calculatePositions();
  }

  collapseNode(node: MindMapNode, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    node.expanded = false;
    this.calculatePositions();
  }

  toggleNode(node: MindMapNode, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    if (node.children.length > 0) {
      node.expanded = !node.expanded;
      this.calculatePositions();
    }
  }

  changeView(mode: 'tree' | 'radial' | 'force'): void {
    this.viewMode = mode;
    this.calculatePositions();
  }

  zoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel + 0.1, 2);
  }

  zoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.5);
  }

  resetView(): void {
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    this.selectedNode = null;
  }

  exportImage(): void {
    alert('Exporting mind map as PNG... (Feature to be implemented)');
  }

  getAllNodes(node: MindMapNode | null = this.currentMindMap): MindMapNode[] {
    if (!node) return [];

    let nodes: MindMapNode[] = [node];

    if (node.expanded) {
      node.children.forEach(child => {
        nodes = nodes.concat(this.getAllNodes(child));
      });
    }

    return nodes;
  }

  getConnections(): { from: MindMapNode, to: MindMapNode }[] {
    const connections: { from: MindMapNode, to: MindMapNode }[] = [];

    const traverse = (node: MindMapNode) => {
      if (node.expanded) {
        node.children.forEach(child => {
          connections.push({ from: node, to: child });
          traverse(child);
        });
      }
    };

    if (this.currentMindMap) {
      traverse(this.currentMindMap);
    }

    return connections;
  }

  getNodeRadius(level: number): number {
    return 60 - (level * 8);
  }

  clearSelection(): void {
    this.selectedNode = null;
  }
}
