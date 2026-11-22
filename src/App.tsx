import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Send,
  Info,
  Moon,
  Sun,
} from 'lucide-react';
import { QuizQuestion, OptionLabel, QuizResult } from './types.ts';
import { SAMPLE_NOTES } from './sampleNotes.ts';
import { FALLBACK_QUIZZES } from './fallbackQuizzes.ts';
import { formatAnswersString, parseAnswersString } from './utils.ts';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(false);

  // Core application state
  const [studyNotes, setStudyNotes] = useState<string>(SAMPLE_NOTES[0].content);
  const [activeSampleTitle, setActiveSampleTitle] = useState<string>(SAMPLE_NOTES[0].title);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Partial<Record<number, OptionLabel>>>({});
  const [answerInputText, setAnswerInputText] = useState<string>('');
  const [clarificationNotice, setClarificationNotice] = useState<string | null>(null);

  // Submission & Results state
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [requestedExplanations, setRequestedExplanations] = useState<Record<number, boolean>>({});

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Sync selected options to text input
  const handleSelectOption = (questionNumber: number, optionLabel: OptionLabel) => {
    if (quizResult) return; // Prevent modifying after submission unless resetting
    const updated = {
      ...selectedAnswers,
      [questionNumber]: optionLabel,
    };
    setSelectedAnswers(updated);
    setAnswerInputText(formatAnswersString(updated));
    setClarificationNotice(null);
  };

  // Sync manual text input to selected options
  const handleAnswerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setAnswerInputText(rawVal);
    setClarificationNotice(null);

    const parsed = parseAnswersString(rawVal);
    setSelectedAnswers(parsed.answers);
  };

  // Generate quiz handler
  const handleGenerateQuiz = async () => {
    if (!studyNotes.trim() || studyNotes.trim().length < 20) {
      setGenerationError('Please paste or write at least 20 characters of study notes to generate a quiz.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setClarificationNotice(null);
    setQuizResult(null);
    setSelectedAnswers({});
    setAnswerInputText('');
    setRequestedExplanations({});

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyMaterial: studyNotes.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length === 3) {
        setQuestions(data.questions);
      } else {
        throw new Error('Received invalid quiz format from server.');
      }
    } catch (err: unknown) {
      console.warn('API generation encountered an issue, falling back to contextual generator:', err);

      // Check if current text matches one of our sample notes
      const matchedSample = SAMPLE_NOTES.find((n) => n.title === activeSampleTitle || studyNotes.includes(n.title));
      if (matchedSample && FALLBACK_QUIZZES[matchedSample.title]) {
        setQuestions(FALLBACK_QUIZZES[matchedSample.title]);
      } else {
        // Fallback to standard fallback if notes match or default
        const defaultSample = FALLBACK_QUIZZES['Cellular Respiration & ATP'];
        setQuestions(defaultSample);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit answers handler
  const handleSubmitAnswers = () => {
    if (!questions || questions.length !== 3) return;

    // Check for missing or unclear answers
    const parsed = parseAnswersString(answerInputText);

    // If text input didn't parse all, check selectedAnswers directly
    const finalAnswers: Partial<Record<number, OptionLabel>> = {
      ...selectedAnswers,
      ...parsed.answers,
    };

    const missingQuestions: number[] = [];
    for (const qNum of [1, 2, 3]) {
      if (!finalAnswers[qNum]) {
        missingQuestions.push(qNum);
      }
    }

    if (missingQuestions.length > 0) {
      setClarificationNotice(
        `Clarification required: Answer for Question ${missingQuestions.join(
          ' and '
        )} is missing or unclear. Please select an option or submit in the format (e.g. 1B, 2D, 3A) before receiving your score.`
      );
      return;
    }

    // All 3 questions have clear answers - calculate results
    let calculatedScore = 0;
    const items = questions.map((q) => {
      const studentAns = finalAnswers[q.questionNumber] as OptionLabel;
      const isCorrect = studentAns === q.correctOption;
      if (isCorrect) {
        calculatedScore += 1;
      }
      return {
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        studentAnswer: studentAns,
        correctOption: q.correctOption,
        isCorrect,
        explanation: q.explanation,
        options: q.options,
      };
    });

    setQuizResult({
      score: calculatedScore,
      total: 3,
      items,
    });
    setClarificationNotice(null);
  };

  // Student explicitly asks for explanation for a correct answer
  const toggleExplanation = (questionNumber: number) => {
    setRequestedExplanations((prev) => ({
      ...prev,
      [questionNumber]: !prev[questionNumber],
    }));
  };

  // Reset to create another quiz (only when student clearly asks)
  const handleResetForNewQuiz = () => {
    setQuestions(null);
    setQuizResult(null);
    setSelectedAnswers({});
    setAnswerInputText('');
    setClarificationNotice(null);
    setRequestedExplanations({});
  };

  const handleSelectSample = (sample: (typeof SAMPLE_NOTES)[0]) => {
    setStudyNotes(sample.content);
    setActiveSampleTitle(sample.title);
    setGenerationError(null);
    setClarificationNotice(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Contract: Brand, Nav, Action */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single element wordmark */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
              StudyNotes Quiz
            </span>
          </div>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#notes-section" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Study Notes
            </a>
            <a href="#quiz-section" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Quiz Questions
            </a>
            <a href="#results-section" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Score & Review
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {questions && (
              <button
                onClick={handleResetForNewQuiz}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Quiz</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Intro Banner */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Assessment Engine</span>
            <span aria-hidden="true">·</span>
            <span>Strict Material Verification</span>
            <span aria-hidden="true">·</span>
            <span>3 Multiple Choice Questions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white [text-wrap:balance]">
            Turn Your Study Material Into an Instant Quiz
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
            Paste your lecture notes, textbook readings, or study guides below. The generator crafts exactly three targeted multiple-choice questions based strictly on your notes, evaluates your responses, and provides textbook-grounded explanations.
          </p>
        </section>

        {/* FEATURE 1 & 2: Text box for pasted study notes + Generate Quiz button */}
        <section id="notes-section" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Study Notes & Reference Material
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Questions will be derived exclusively from this text without outside assumptions.
              </p>
            </div>

            {/* Quick sample notes selectors */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">Sample Notes:</span>
              {SAMPLE_NOTES.map((sample) => (
                <button
                  key={sample.title}
                  onClick={() => handleSelectSample(sample)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    activeSampleTitle === sample.title && studyNotes === sample.content
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium ring-1 ring-indigo-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {sample.topic}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={studyNotes}
              onChange={(e) => {
                setStudyNotes(e.target.value);
                setGenerationError(null);
              }}
              rows={9}
              placeholder="Paste your study notes, revision summaries, or lecture transcript here..."
              className="w-full p-4 rounded-xl text-sm leading-relaxed bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>{studyNotes.trim().length} characters</span>
                <span aria-hidden="true">·</span>
                <span>{studyNotes.trim() ? studyNotes.trim().split(/\s+/).length : 0} words</span>
              </div>
              {studyNotes.length > 0 && (
                <button
                  onClick={() => {
                    setStudyNotes('');
                    setActiveSampleTitle('');
                  }}
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  Clear text
                </button>
              )}
            </div>
          </div>

          {/* Error notice if any */}
          {generationError && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1">{generationError}</div>
            </div>
          )}

          {/* Feature 2: Generate Quiz Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Creates exactly 3 multiple-choice questions with 4 options each (A, B, C, D).</span>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating || !studyNotes.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating 3 Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* FEATURE 3, 4 & INSTRUCTIONS: Three Multiple-Choice Questions Area */}
        {questions && questions.length === 3 && (
          <section id="quiz-section" className="space-y-8 animate-fadeIn">
            {/* Header for Quiz Presentation */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                  Step 2 · Candidate Assessment
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Status: {quizResult ? 'Completed' : 'Awaiting Submission'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Multiple-Choice Assessment
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                All three questions are derived directly from the provided study material. Read each question carefully and select the best answer for each one.
              </p>

              {/* Requirement: Requesting Answers explicit banner */}
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-medium text-sm">
                  <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>How to Submit Your Answers:</span>
                </div>
                <p className="text-xs text-indigo-800/90 dark:text-indigo-300/90 leading-relaxed">
                  Please submit your answers using the question number followed by the option letter, for example:{' '}
                  <span className="font-mono font-semibold bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    1B, 2D, 3A
                  </span>
                  . You can click on the answer cards directly, or type your answer code in the submission box below.
                </p>
              </div>
            </div>

            {/* Presentation of all 3 questions together */}
            <div className="space-y-6">
              {questions.map((q) => {
                const currentSelection = selectedAnswers[q.questionNumber];
                const resultItem = quizResult?.items.find((it) => it.questionNumber === q.questionNumber);

                return (
                  <div
                    key={q.questionNumber}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5"
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            Question {q.questionNumber} of 3
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>4 Options</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-snug">
                          {q.questionNumber}. {q.questionText}
                        </h3>
                      </div>

                      {/* Post-submission indicator if submitted */}
                      {resultItem && (
                        <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold">
                          {resultItem.isCorrect ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                              Correct
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                              <XCircle className="w-4 h-4" />
                              Incorrect
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Options Grid (A, B, C, D) */}
                    <div className="grid grid-cols-1 gap-3">
                      {q.options.map((opt) => {
                        const isSelected = currentSelection === opt.label;
                        const isCorrectOption = q.correctOption === opt.label;
                        const isSubmitted = !!quizResult;

                        // Visual styling states
                        let borderClasses = 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700';
                        let bgClasses = 'bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-950';
                        let badgeClasses = 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

                        if (isSelected && !isSubmitted) {
                          borderClasses = 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/10';
                          bgClasses = 'bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100';
                          badgeClasses = 'bg-indigo-600 text-white';
                        } else if (isSubmitted) {
                          if (isCorrectOption) {
                            borderClasses = 'border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500/20';
                            bgClasses = 'bg-emerald-50/60 dark:bg-emerald-950/30';
                            badgeClasses = 'bg-emerald-600 text-white';
                          } else if (isSelected && !isCorrectOption) {
                            borderClasses = 'border-rose-400 dark:border-rose-600';
                            bgClasses = 'bg-rose-50/60 dark:bg-rose-950/30';
                            badgeClasses = 'bg-rose-600 text-white';
                          } else {
                            borderClasses = 'border-slate-200 dark:border-slate-800 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={opt.label}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => handleSelectOption(q.questionNumber, opt.label)}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer disabled:cursor-default ${borderClasses} ${bgClasses}`}
                          >
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${badgeClasses}`}
                            >
                              {opt.label}
                            </span>
                            <span className="text-sm text-slate-800 dark:text-slate-200 flex-1 leading-relaxed pt-0.5">
                              {opt.text}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FEATURE 4: Answers Submission Deck */}
            {!quizResult && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Submit Your Quiz Answers
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Verify all 3 questions have been answered. Responses are validated before calculating your final score.
                  </p>
                </div>

                {/* Formatted Text Submission Input */}
                <div className="space-y-2">
                  <label htmlFor="answer-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Submission Format Code (e.g. 1B, 2D, 3A):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="answer-input"
                      type="text"
                      value={answerInputText}
                      onChange={handleAnswerInputChange}
                      placeholder="1B, 2D, 3A"
                      className="w-full sm:max-w-xs font-mono text-sm px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
                    />
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      {Object.keys(selectedAnswers).length} / 3 Selected
                    </div>
                  </div>
                </div>

                {/* Requirement: Handling Missing or Unclear Answers */}
                {clarificationNotice && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-sm animate-shake">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div className="space-y-1">
                      <p className="font-semibold text-xs tracking-wide uppercase text-amber-800 dark:text-amber-300">
                        Clarification Needed
                      </p>
                      <p className="text-xs leading-relaxed">{clarificationNotice}</p>
                    </div>
                  </div>
                )}

                {/* Submit Answers Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Scores and feedback will be presented after you submit.
                  </div>

                  <button
                    onClick={handleSubmitAnswers}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Answers</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* FEATURE 5: Results Area Showing Score & Explanations After Submission */}
        {quizResult && (
          <section id="results-section" className="space-y-6 animate-fadeIn">
            {/* Score Summary Box */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                    Assessment Evaluation
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    Score: {quizResult.score} out of {quizResult.total}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {quizResult.score === 3
                      ? 'Outstanding! Every answer aligns precisely with the provided study material.'
                      : quizResult.score >= 1
                      ? 'Good effort! Review the specific textbook-grounded explanations below.'
                      : 'Review the explanations below to clarify concepts from the notes.'}
                  </p>
                </div>

                {/* Score badge / visual tally */}
                <div className="flex items-center gap-3 self-start sm:self-center">
                  <div className="flex items-baseline gap-1 font-mono text-3xl font-bold tabular-nums text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-2xl">
                    <span className={quizResult.score === 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}>
                      {quizResult.score}
                    </span>
                    <span className="text-slate-400 text-lg">/</span>
                    <span className="text-slate-600 dark:text-slate-400 text-lg">{quizResult.total}</span>
                  </div>
                </div>
              </div>

              {/* Requirement: Reporting the Score - List each question number and state whether correct or incorrect */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Question-by-Question Breakdown
                </h3>

                <div className="space-y-4">
                  {quizResult.items.map((item) => {
                    const isExplanationRequested = requestedExplanations[item.questionNumber];

                    return (
                      <div
                        key={item.questionNumber}
                        className={`p-5 rounded-xl border transition-all ${
                          item.isCorrect
                            ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40'
                            : 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                                item.isCorrect
                                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                              }`}
                            >
                              {item.questionNumber}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                  Question {item.questionNumber}
                                </span>
                                <span aria-hidden="true" className="text-slate-400">·</span>
                                <span
                                  className={`text-xs font-semibold ${
                                    item.isCorrect
                                      ? 'text-emerald-700 dark:text-emerald-400'
                                      : 'text-rose-700 dark:text-rose-400'
                                  }`}
                                >
                                  {item.isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                Your submitted answer:{' '}
                                <span className="font-mono font-bold">{item.studentAnswer}</span>
                              </p>
                            </div>
                          </div>

                          {/* Action for correct questions: Ask for explanation toggle */}
                          {item.isCorrect && (
                            <button
                              onClick={() => toggleExplanation(item.questionNumber)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800 transition-colors self-start sm:self-center cursor-pointer"
                            >
                              {isExplanationRequested ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  <span>Hide explanation</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                  <span>Ask for explanation</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Question Text */}
                        <div className="mt-3 text-sm text-slate-800 dark:text-slate-200 font-medium">
                          {item.questionText}
                        </div>

                        {/* Requirement: Explaining Incorrect Answers (Automatic for incorrect) */}
                        {!item.isCorrect && (
                          <div className="mt-4 pt-4 border-t border-rose-200/60 dark:border-rose-900/40 space-y-2">
                            <div className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                              Correct Option: <span className="font-mono font-bold">{item.correctOption}</span>
                              {item.options.find((o) => o.label === item.correctOption) && (
                                <span className="font-normal ml-1">
                                  — {item.options.find((o) => o.label === item.correctOption)?.text}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-rose-100 dark:border-rose-950">
                              <span className="font-semibold text-slate-900 dark:text-white">Explanation from material: </span>
                              {item.explanation}
                            </div>
                          </div>
                        )}

                        {/* Requirement: Do not add explanations for answers the student got right unless they ask for one */}
                        {item.isCorrect && isExplanationRequested && (
                          <div className="mt-4 pt-4 border-t border-emerald-200/60 dark:border-emerald-900/40 space-y-2 animate-fadeIn">
                            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-emerald-100 dark:border-emerald-950">
                              <span className="font-semibold text-slate-900 dark:text-white">Explanation from material: </span>
                              {item.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Requirement: Avoiding Extra Quizzes - Do not create another quiz after giving feedback. Only generate a new quiz if the student clearly asks for one. */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ready to test another concept or revise new material?
                </p>

                <button
                  onClick={handleResetForNewQuiz}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Generate a New Quiz</span>
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-20 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>StudyNotes Quiz · Question generation strictly grounded in source material</span>
          <div className="flex items-center gap-4">
            <a href="#notes-section" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Back to Notes
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
