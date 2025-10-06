import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { AuthService } from '../../../services/auth.service';

interface FlashCard {
  question: string;
  answer: string;
  explanation: string;
  status: 'learning' | 'reviewing' | 'mastered';
}

interface Deck {
  id: number;
  name: string;
  cards: FlashCard[];
  difficulty: 'easy' | 'medium' | 'hard';
  mastered: number;
  reviewing: number;
  learning: number;
  createdDate: Date;
}

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.scss']
})
export class FlashcardsComponent implements OnInit {
  user: any = null;

  // Generation options
  availableDocuments = [
    { id: 1, name: 'Machine Learning Fundamentals.pdf' },
    { id: 2, name: 'Data Structures & Algorithms.pdf' },
    { id: 3, name: 'Web Development Course.pdf' },
    { id: 4, name: 'Introduction to AI.pdf' }
  ];
  selectedDocumentId: number | null = null;
  numberOfCards = 20;
  difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  generating = false;

  // Current deck
  currentDeck: Deck | null = null;
  studyMode = false;
  currentCardIndex = 0;
  isFlipped = false;
  showCompletion = false;

  // Saved decks
  savedDecks: Deck[] = [
    {
      id: 1,
      name: 'Machine Learning Fundamentals',
      cards: [],
      difficulty: 'medium',
      mastered: 8,
      reviewing: 5,
      learning: 7,
      createdDate: new Date(Date.now() - 86400000)
    },
    {
      id: 2,
      name: 'Data Structures & Algorithms',
      cards: [],
      difficulty: 'hard',
      mastered: 12,
      reviewing: 6,
      learning: 2,
      createdDate: new Date(Date.now() - 172800000)
    }
  ];

  // Session stats
  sessionStats = {
    easy: 0,
    medium: 0,
    hard: 0
  };

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
  }

  generateFlashcards(): void {
    if (!this.selectedDocumentId) return;

    this.generating = true;

    // Simulate generation
    setTimeout(() => {
      const selectedDoc = this.availableDocuments.find(d => d.id === this.selectedDocumentId);
      this.currentDeck = this.createMockDeck(selectedDoc?.name || 'New Deck');
      this.generating = false;
      this.resetSessionStats();
    }, 3000);
  }

  createMockDeck(name: string): Deck {
    const cards: FlashCard[] = [];
    const topics = [
      {
        question: 'What is supervised learning?',
        answer: 'Supervised learning is a type of machine learning where the model is trained on labeled data with input-output pairs.',
        explanation: 'The algorithm learns from examples where the correct answer is provided, allowing it to make predictions on new, unseen data. Common applications include classification and regression tasks.'
      },
      {
        question: 'Define overfitting in machine learning.',
        answer: 'Overfitting occurs when a model learns the training data too well, including its noise and outliers, leading to poor generalization on new data.',
        explanation: 'An overfitted model performs excellently on training data but poorly on test data. This happens when the model is too complex relative to the amount and noisiness of the training data.'
      },
      {
        question: 'What is cross-validation?',
        answer: 'Cross-validation is a technique to evaluate model performance by partitioning data into subsets, training on some subsets and validating on others.',
        explanation: 'K-fold cross-validation divides data into k subsets, using k-1 for training and 1 for validation, rotating through all combinations. This provides a more robust estimate of model performance.'
      },
      {
        question: 'Explain the bias-variance tradeoff.',
        answer: 'The bias-variance tradeoff is the balance between a model\'s ability to minimize bias (error from incorrect assumptions) and variance (error from sensitivity to training data).',
        explanation: 'High bias leads to underfitting (oversimplified model), while high variance leads to overfitting (too complex model). The goal is to find the optimal balance for best generalization.'
      },
      {
        question: 'What is a neural network?',
        answer: 'A neural network is a computing system inspired by biological neural networks, consisting of interconnected nodes (neurons) organized in layers.',
        explanation: 'Neural networks can learn complex patterns through training. They consist of an input layer, hidden layers, and an output layer, with each connection having an associated weight that adjusts during training.'
      },
      {
        question: 'Define gradient descent.',
        answer: 'Gradient descent is an optimization algorithm used to minimize the cost function by iteratively moving in the direction of steepest descent.',
        explanation: 'The algorithm calculates the gradient (derivative) of the cost function and updates parameters in the opposite direction. The learning rate determines the step size of each update.'
      },
      {
        question: 'What is regularization?',
        answer: 'Regularization is a technique to prevent overfitting by adding a penalty term to the cost function, discouraging complex models.',
        explanation: 'Common regularization methods include L1 (Lasso) and L2 (Ridge) regularization. They constrain the model parameters, promoting simpler models that generalize better to new data.'
      },
      {
        question: 'Explain the concept of feature engineering.',
        answer: 'Feature engineering is the process of creating, selecting, and transforming variables (features) to improve model performance.',
        explanation: 'It involves domain knowledge to create meaningful features from raw data. Good features can significantly improve model accuracy and reduce training time.'
      },
      {
        question: 'What is a confusion matrix?',
        answer: 'A confusion matrix is a table used to evaluate classification model performance, showing true positives, true negatives, false positives, and false negatives.',
        explanation: 'It provides detailed insight into model errors and helps calculate metrics like precision, recall, F1-score, and accuracy. Each row represents actual classes, and columns represent predicted classes.'
      },
      {
        question: 'Define ensemble learning.',
        answer: 'Ensemble learning combines multiple models to produce better predictions than any individual model alone.',
        explanation: 'Common ensemble methods include bagging (like Random Forest), boosting (like XGBoost), and stacking. By aggregating predictions, ensembles reduce variance and improve generalization.'
      }
    ];

    // Select cards based on numberOfCards
    const selectedTopics = topics.slice(0, Math.min(this.numberOfCards, topics.length));

    selectedTopics.forEach(topic => {
      cards.push({
        ...topic,
        status: 'learning'
      });
    });

    return {
      id: Date.now(),
      name: name.replace('.pdf', ''),
      cards,
      difficulty: this.difficulty,
      mastered: 0,
      reviewing: 0,
      learning: cards.length,
      createdDate: new Date()
    };
  }

  loadDeck(deck: Deck): void {
    // In a real app, would load full deck from backend
    this.currentDeck = {
      ...deck,
      cards: this.createMockDeck(deck.name).cards
    };
    this.resetSessionStats();
  }

  startStudyMode(): void {
    if (!this.currentDeck || this.currentDeck.cards.length === 0) return;
    this.studyMode = true;
    this.currentCardIndex = 0;
    this.isFlipped = false;
    this.showCompletion = false;
  }

  exitStudyMode(): void {
    this.studyMode = false;
    this.currentCardIndex = 0;
    this.isFlipped = false;
  }

  flipCard(): void {
    this.isFlipped = !this.isFlipped;
  }

  rateCard(rating: 'easy' | 'medium' | 'hard'): void {
    if (!this.currentDeck) return;

    const currentCard = this.getCurrentCard();
    if (!currentCard) return;

    // Update session stats
    this.sessionStats[rating]++;

    // Update card status based on rating
    if (rating === 'easy') {
      currentCard.status = 'mastered';
    } else if (rating === 'medium') {
      currentCard.status = 'reviewing';
    } else {
      currentCard.status = 'learning';
    }

    // Update deck stats
    this.updateDeckStats();

    // Move to next card or show completion
    if (this.currentCardIndex < this.currentDeck.cards.length - 1) {
      this.nextCard();
    } else {
      this.showCompletion = true;
    }
  }

  nextCard(): void {
    if (!this.currentDeck) return;
    if (this.currentCardIndex < this.currentDeck.cards.length - 1) {
      this.currentCardIndex++;
      this.isFlipped = false;
    }
  }

  previousCard(): void {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      this.isFlipped = false;
    }
  }

  getCurrentCard(): FlashCard | null {
    if (!this.currentDeck || !this.currentDeck.cards) return null;
    return this.currentDeck.cards[this.currentCardIndex] || null;
  }

  updateDeckStats(): void {
    if (!this.currentDeck) return;

    this.currentDeck.mastered = this.currentDeck.cards.filter(c => c.status === 'mastered').length;
    this.currentDeck.reviewing = this.currentDeck.cards.filter(c => c.status === 'reviewing').length;
    this.currentDeck.learning = this.currentDeck.cards.filter(c => c.status === 'learning').length;
  }

  shuffleDeck(): void {
    if (!this.currentDeck || !this.currentDeck.cards) return;

    const cards = [...this.currentDeck.cards];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    this.currentDeck.cards = cards;
    this.currentCardIndex = 0;
    this.isFlipped = false;
  }

  exportDeck(): void {
    if (!this.currentDeck) return;

    const content = this.formatDeckForExport();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentDeck.name}_flashcards.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  formatDeckForExport(): string {
    if (!this.currentDeck) return '';

    let content = `${this.currentDeck.name}\n`;
    content += `Difficulty: ${this.currentDeck.difficulty}\n`;
    content += `Total Cards: ${this.currentDeck.cards.length}\n`;
    content += `Created: ${this.currentDeck.createdDate.toLocaleString()}\n\n`;
    content += '='.repeat(50) + '\n\n';

    this.currentDeck.cards.forEach((card, index) => {
      content += `Card ${index + 1}\n`;
      content += `Q: ${card.question}\n`;
      content += `A: ${card.answer}\n`;
      content += `Explanation: ${card.explanation}\n`;
      content += `Status: ${card.status}\n`;
      content += '\n' + '-'.repeat(50) + '\n\n';
    });

    return content;
  }

  deleteDeck(deckId: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this deck?')) {
      this.savedDecks = this.savedDecks.filter(d => d.id !== deckId);
    }
  }

  backToSelection(): void {
    this.currentDeck = null;
    this.studyMode = false;
    this.currentCardIndex = 0;
    this.isFlipped = false;
    this.showCompletion = false;
    this.resetSessionStats();
  }

  restartStudy(): void {
    this.currentCardIndex = 0;
    this.isFlipped = false;
    this.showCompletion = false;
    this.resetSessionStats();
    this.studyMode = true;
  }

  finishStudy(): void {
    // Save deck to saved decks if new
    if (this.currentDeck && !this.savedDecks.find(d => d.id === this.currentDeck!.id)) {
      this.savedDecks.unshift(this.currentDeck);
    }
    this.backToSelection();
  }

  resetSessionStats(): void {
    this.sessionStats = {
      easy: 0,
      medium: 0,
      hard: 0
    };
  }

  get progressPercentage(): number {
    if (!this.currentDeck || this.currentDeck.cards.length === 0) return 0;
    return Math.round((this.currentCardIndex / this.currentDeck.cards.length) * 100);
  }

  getTotalSessionCards(): number {
    return this.sessionStats.easy + this.sessionStats.medium + this.sessionStats.hard;
  }
}
