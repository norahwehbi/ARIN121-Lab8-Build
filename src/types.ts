export type OptionLabel = 'A' | 'B' | 'C' | 'D';

export interface QuizOption {
  label: OptionLabel;
  text: string;
}

export interface QuizQuestion {
  questionNumber: number;
  questionText: string;
  options: QuizOption[];
  correctOption: OptionLabel;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  items: {
    questionNumber: number;
    questionText: string;
    studentAnswer: OptionLabel;
    correctOption: OptionLabel;
    isCorrect: boolean;
    explanation: string;
    options: QuizOption[];
  }[];
}
