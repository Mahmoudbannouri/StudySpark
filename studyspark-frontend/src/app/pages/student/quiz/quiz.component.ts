import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { AuthService } from '../../../services/auth.service';

interface Question {
  id: number;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
  explanation: string;
}

interface Quiz {
  id: number;
  name: string;
  questions: Question[];
  totalQuestions: number;
  score: number | null;
  date: Date;
  difficulty: 'easy' | 'medium' | 'hard';
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit, OnDestroy {
  user: any = null;

  // Generation options
  availableDocuments = [
    { id: 1, name: 'Machine Learning Fundamentals.pdf' },
    { id: 2, name: 'Data Structures & Algorithms.pdf' },
    { id: 3, name: 'Web Development Course.pdf' },
    { id: 4, name: 'Introduction to AI.pdf' }
  ];
  selectedDocumentId: number | null = null;
  numberOfQuestions = 20;
  difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  questionTypes = {
    multipleChoice: true,
    trueFalse: true,
    shortAnswer: false
  };
  generating = false;

  // Current quiz
  currentQuiz: Quiz | null = null;
  quizMode = false;
  currentQuestionIndex = 0;
  timeRemaining = 1800; // 30 minutes in seconds
  showResults = false;
  timerInterval: any = null;

  // Saved quizzes
  savedQuizzes: Quiz[] = [
    {
      id: 1,
      name: 'Machine Learning Fundamentals Quiz',
      questions: [],
      totalQuestions: 20,
      score: 85,
      date: new Date(Date.now() - 86400000),
      difficulty: 'medium'
    },
    {
      id: 2,
      name: 'Data Structures & Algorithms Quiz',
      questions: [],
      totalQuestions: 15,
      score: 92,
      date: new Date(Date.now() - 172800000),
      difficulty: 'hard'
    }
  ];

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.getUserInfo();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  hasSelectedQuestionType(): boolean {
    return this.questionTypes.multipleChoice ||
           this.questionTypes.trueFalse ||
           this.questionTypes.shortAnswer;
  }

  generateQuiz(): void {
    if (!this.selectedDocumentId || !this.hasSelectedQuestionType()) return;

    this.generating = true;

    // Simulate generation
    setTimeout(() => {
      const selectedDoc = this.availableDocuments.find(d => d.id === this.selectedDocumentId);
      this.currentQuiz = this.createMockQuiz(selectedDoc?.name || 'New Quiz');
      this.generating = false;
    }, 3000);
  }

  createMockQuiz(name: string): Quiz {
    const questions: Question[] = [];
    let questionId = 1;

    // Multiple choice questions
    if (this.questionTypes.multipleChoice) {
      const mcQuestions = [
        {
          text: 'What is the primary purpose of supervised learning?',
          options: [
            'To learn from unlabeled data',
            'To make predictions based on labeled training data',
            'To reduce dimensionality',
            'To cluster similar data points'
          ],
          correctAnswer: 'To make predictions based on labeled training data',
          explanation: 'Supervised learning uses labeled data to train models that can make predictions on new, unseen data.'
        },
        {
          text: 'Which algorithm is commonly used for classification tasks?',
          options: [
            'K-means clustering',
            'PCA',
            'Random Forest',
            'Apriori'
          ],
          correctAnswer: 'Random Forest',
          explanation: 'Random Forest is an ensemble learning method commonly used for both classification and regression tasks.'
        },
        {
          text: 'What does overfitting mean in machine learning?',
          options: [
            'Model is too simple',
            'Model learns training data too well, including noise',
            'Model cannot converge',
            'Model has too few parameters'
          ],
          correctAnswer: 'Model learns training data too well, including noise',
          explanation: 'Overfitting occurs when a model learns the training data too well, capturing noise and outliers, leading to poor generalization.'
        }
      ];

      mcQuestions.forEach(q => {
        questions.push({
          id: questionId++,
          text: q.text,
          type: 'multiple-choice',
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        });
      });
    }

    // True/False questions
    if (this.questionTypes.trueFalse) {
      const tfQuestions = [
        {
          text: 'Neural networks are inspired by biological neural networks in the human brain.',
          correctAnswer: 'True',
          explanation: 'Neural networks are indeed computing systems inspired by biological neural networks found in animal brains.'
        },
        {
          text: 'Cross-validation is only used for training models, not for evaluation.',
          correctAnswer: 'False',
          explanation: 'Cross-validation is primarily used for evaluating model performance and helping to prevent overfitting.'
        },
        {
          text: 'Gradient descent always finds the global minimum of a cost function.',
          correctAnswer: 'False',
          explanation: 'Gradient descent can get stuck in local minima, especially with non-convex cost functions. It does not guarantee finding the global minimum.'
        }
      ];

      tfQuestions.forEach(q => {
        questions.push({
          id: questionId++,
          text: q.text,
          type: 'true-false',
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        });
      });
    }

    // Short answer questions
    if (this.questionTypes.shortAnswer) {
      const saQuestions = [
        {
          text: 'Define the bias-variance tradeoff in machine learning.',
          correctAnswer: 'The bias-variance tradeoff is the balance between a model\'s ability to minimize bias (error from incorrect assumptions) and variance (error from sensitivity to training data).',
          explanation: 'High bias leads to underfitting, while high variance leads to overfitting. The goal is to find the optimal balance.'
        },
        {
          text: 'What is the purpose of regularization in machine learning?',
          correctAnswer: 'Regularization prevents overfitting by adding a penalty term to the cost function, discouraging overly complex models.',
          explanation: 'Common regularization techniques include L1 (Lasso) and L2 (Ridge) regularization, which constrain model parameters.'
        }
      ];

      saQuestions.forEach(q => {
        questions.push({
          id: questionId++,
          text: q.text,
          type: 'short-answer',
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        });
      });
    }

    // Limit to requested number of questions
    const selectedQuestions = questions.slice(0, Math.min(this.numberOfQuestions, questions.length));

    return {
      id: Date.now(),
      name: name.replace('.pdf', '') + ' Quiz',
      questions: selectedQuestions,
      totalQuestions: selectedQuestions.length,
      score: null,
      date: new Date(),
      difficulty: this.difficulty
    };
  }

  loadQuiz(quiz: Quiz): void {
    // In a real app, would load full quiz from backend
    this.currentQuiz = {
      ...quiz,
      questions: this.createMockQuiz(quiz.name).questions
    };
    this.quizMode = false;
    this.showResults = false;
  }

  startQuiz(): void {
    if (!this.currentQuiz || this.currentQuiz.questions.length === 0) return;

    this.quizMode = true;
    this.currentQuestionIndex = 0;
    this.timeRemaining = 1800; // Reset timer to 30 minutes
    this.showResults = false;

    // Reset all user answers
    this.currentQuiz.questions.forEach(q => q.userAnswer = undefined);

    this.startTimer();
  }

  exitQuiz(): void {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
      this.stopTimer();
      this.quizMode = false;
      this.currentQuestionIndex = 0;
    }
  }

  startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.submitQuiz();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  submitQuiz(): void {
    this.stopTimer();
    this.calculateScore();
    this.quizMode = false;
    this.showResults = true;

    // Save quiz if not already saved
    if (this.currentQuiz && !this.savedQuizzes.find(q => q.id === this.currentQuiz!.id)) {
      this.savedQuizzes.unshift(this.currentQuiz);
    }
  }

  selectAnswer(answer: string): void {
    const currentQuestion = this.getCurrentQuestion();
    if (currentQuestion) {
      currentQuestion.userAnswer = answer;
    }
  }

  nextQuestion(): void {
    if (!this.currentQuiz) return;
    if (this.currentQuestionIndex < this.currentQuiz.totalQuestions - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  getCurrentQuestion(): Question | null {
    if (!this.currentQuiz || !this.currentQuiz.questions) return null;
    return this.currentQuiz.questions[this.currentQuestionIndex] || null;
  }

  calculateScore(): void {
    if (!this.currentQuiz) return;

    let correct = 0;
    this.currentQuiz.questions.forEach(question => {
      if (this.isAnswerCorrect(question)) {
        correct++;
      }
    });

    this.currentQuiz.score = Math.round((correct / this.currentQuiz.totalQuestions) * 100);
  }

  isAnswerCorrect(question: Question): boolean {
    if (!question.userAnswer) return false;

    if (question.type === 'short-answer') {
      // Simple comparison for demo - in real app would use NLP/semantic comparison
      const userAnswer = question.userAnswer.toLowerCase().trim();
      const correctAnswer = question.correctAnswer.toLowerCase().trim();
      return userAnswer.includes(correctAnswer.substring(0, 20)) ||
             correctAnswer.includes(userAnswer.substring(0, 20));
    }

    return question.userAnswer === question.correctAnswer;
  }

  getCorrectAnswers(): number {
    if (!this.currentQuiz) return 0;
    return this.currentQuiz.questions.filter(q => this.isAnswerCorrect(q)).length;
  }

  getIncorrectAnswers(): number {
    if (!this.currentQuiz) return 0;
    return this.currentQuiz.totalQuestions - this.getCorrectAnswers();
  }

  retakeQuiz(): void {
    this.showResults = false;
    this.startQuiz();
  }

  backToSelection(): void {
    this.stopTimer();
    this.currentQuiz = null;
    this.quizMode = false;
    this.currentQuestionIndex = 0;
    this.showResults = false;
    this.timeRemaining = 1800;
  }

  deleteQuiz(quizId: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this quiz?')) {
      this.savedQuizzes = this.savedQuizzes.filter(q => q.id !== quizId);
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getProgressPercentage(): number {
    if (!this.currentQuiz || this.currentQuiz.totalQuestions === 0) return 0;
    return Math.round(((this.currentQuestionIndex + 1) / this.currentQuiz.totalQuestions) * 100);
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }

  getScoreClass(): string {
    if (!this.currentQuiz || this.currentQuiz.score === null) return '';
    if (this.currentQuiz.score >= 90) return 'excellent';
    if (this.currentQuiz.score >= 70) return 'good';
    if (this.currentQuiz.score >= 50) return 'average';
    return 'poor';
  }

  getScoreMessage(): string {
    if (!this.currentQuiz || this.currentQuiz.score === null) return '';
    if (this.currentQuiz.score >= 90) return 'Excellent work! You have mastered this topic!';
    if (this.currentQuiz.score >= 70) return 'Good job! Keep up the great work!';
    if (this.currentQuiz.score >= 50) return 'Not bad! Review the explanations to improve.';
    return 'Keep practicing! Review the material and try again.';
  }
}
