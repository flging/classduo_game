export interface QuizQuestion {
  type: "word";
  text: string;
  correctAnswer: string;
  wrongAnswers: string[];
}

export type BuffType = "speed" | "jump";
