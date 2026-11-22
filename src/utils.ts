import { OptionLabel } from './types.ts';

export interface ParseResult {
  answers: Partial<Record<number, OptionLabel>>;
  missing: number[];
  isComplete: boolean;
  unclearMessage?: string;
}

export function formatAnswersString(answers: Partial<Record<number, OptionLabel>>): string {
  const parts: string[] = [];
  for (const qNum of [1, 2, 3]) {
    const ans = answers[qNum];
    if (ans) {
      parts.push(`${qNum}${ans}`);
    }
  }
  return parts.join(', ');
}

export function parseAnswersString(rawInput: string): ParseResult {
  const trimmed = rawInput.trim();
  const answers: Partial<Record<number, OptionLabel>> = {};

  if (!trimmed) {
    return {
      answers: {},
      missing: [1, 2, 3],
      isComplete: false,
      unclearMessage: 'No answers provided. Please submit your answers in the format: 1B, 2D, 3A.',
    };
  }

  // Regex to match question number and option letter e.g. "1B", "1: B", "1 - B", "1. B", "Q1: B"
  const itemRegex = /(?:q(?:uestion)?\s*)?([1-3])\s*[:.\-)]?\s*([a-dA-D])/gi;
  let match: RegExpExecArray | null;
  const foundQuestions = new Set<number>();

  while ((match = itemRegex.exec(trimmed)) !== null) {
    const qNum = parseInt(match[1], 10);
    const opt = match[2].toUpperCase() as OptionLabel;
    answers[qNum] = opt;
    foundQuestions.add(qNum);
  }

  const missing: number[] = [];
  for (const q of [1, 2, 3]) {
    if (!foundQuestions.has(q)) {
      missing.push(q);
    }
  }

  let unclearMessage: string | undefined;
  if (missing.length > 0) {
    if (missing.length === 3) {
      unclearMessage =
        'Could not identify your answers. Please format your submission as question number followed by option letter, for example: 1B, 2D, 3A.';
    } else {
      unclearMessage = `Missing answer for question ${missing.join(
        ' and '
      )}. Please provide answers for all three questions before submitting (e.g. 1B, 2D, 3A).`;
    }
  }

  return {
    answers,
    missing,
    isComplete: missing.length === 0,
    unclearMessage,
  };
}
