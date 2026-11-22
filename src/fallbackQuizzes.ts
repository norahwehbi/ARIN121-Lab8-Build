import { QuizQuestion } from './types.ts';

export const FALLBACK_QUIZZES: Record<string, QuizQuestion[]> = {
  'Cellular Respiration & ATP': [
    {
      questionNumber: 1,
      questionText: 'Where does glycolysis occur within eukaryotic cells, and does it require oxygen?',
      options: [
        { label: 'A', text: 'In the mitochondrial matrix, and it requires oxygen' },
        { label: 'B', text: 'In the cytosol, and it does not require oxygen' },
        { label: 'C', text: 'Across the inner mitochondrial membrane, requiring oxygen' },
        { label: 'D', text: 'In the intermembrane space, without requiring oxygen' },
      ],
      correctOption: 'B',
      explanation: 'According to the notes, glycolysis takes place in the cytosol and does not require oxygen.',
    },
    {
      questionNumber: 2,
      questionText: 'Which stage of cellular respiration is responsible for producing the vast majority of ATP molecules?',
      options: [
        { label: 'A', text: 'Glycolysis' },
        { label: 'B', text: 'The Citric Acid Cycle' },
        { label: 'C', text: 'Oxidative Phosphorylation' },
        { label: 'D', text: 'Pyruvate Oxidation' },
      ],
      correctOption: 'C',
      explanation: 'The notes state that oxidative phosphorylation is localized across the inner mitochondrial membrane and accounts for the vast majority of ATP synthesis (yielding roughly 26 to 28 ATP molecules).',
    },
    {
      questionNumber: 3,
      questionText: 'What substance serves as the final electron acceptor in the electron transport chain?',
      options: [
        { label: 'A', text: 'Glucose' },
        { label: 'B', text: 'Carbon dioxide' },
        { label: 'C', text: 'Pyruvate' },
        { label: 'D', text: 'Oxygen' },
      ],
      correctOption: 'D',
      explanation: 'The study material explicitly notes that oxygen acts as the final electron acceptor, forming water.',
    },
  ],
  'The Roman Republic & Senate': [
    {
      questionNumber: 1,
      questionText: 'What was the statutory maximum term limit for a Roman Dictator appointed during an emergency?',
      options: [
        { label: 'A', text: 'One year' },
        { label: 'B', text: 'Six months' },
        { label: 'C', text: 'Two years' },
        { label: 'D', text: 'For life' },
      ],
      correctOption: 'B',
      explanation: 'The notes mention that in moments of severe military crisis, the emergency office of Dictator was strictly limited to a maximum term of six months.',
    },
    {
      questionNumber: 2,
      questionText: 'How many Consuls held executive authority, and how frequently were they elected?',
      options: [
        { label: 'A', text: 'One Consul elected for life' },
        { label: 'B', text: 'Two Consuls elected annually' },
        { label: 'C', text: 'Three Consuls elected every two years' },
        { label: 'D', text: 'Ten Consuls elected by the Senate monthly' },
      ],
      correctOption: 'B',
      explanation: 'The material states executive authority was held by two Consuls, who were elected annually by the Centuriate Assembly.',
    },
    {
      questionNumber: 3,
      questionText: 'Which office was created specifically to protect the common plebeians against patrician overreach with veto power?',
      options: [
        { label: 'A', text: 'Tribune of the Plebs' },
        { label: 'B', text: 'Pontifex Maximus' },
        { label: 'C', text: 'Centuriate Magistrate' },
        { label: 'D', text: 'Military Praetor' },
      ],
      correctOption: 'A',
      explanation: 'According to the study notes, the office of Tribune of the Plebs was established to protect plebeians, granting tribunes sacrosanctity and the right to veto legislative acts.',
    },
  ],
  'Binary Search Algorithm': [
    {
      questionNumber: 1,
      questionText: 'What is the essential prerequisite condition for executing a binary search on a collection?',
      options: [
        { label: 'A', text: 'The array elements must be unique positive integers' },
        { label: 'B', text: 'The collection must be monotonically sorted in ascending or descending order' },
        { label: 'C', text: 'The array size must be an exact power of two' },
        { label: 'D', text: 'The array must be stored in a linked list structure' },
      ],
      correctOption: 'B',
      explanation: 'The text states that the prerequisite condition for binary search is that the collection must be monotonically sorted in ascending or descending order prior to executing the search.',
    },
    {
      questionNumber: 2,
      questionText: 'What is the worst-case time complexity of the binary search algorithm?',
      options: [
        { label: 'A', text: 'O(1)' },
        { label: 'B', text: 'O(n)' },
        { label: 'C', text: 'O(log n)' },
        { label: 'D', text: 'O(n log n)' },
      ],
      correctOption: 'C',
      explanation: 'The study material explicitly states binary search operates on the divide-and-conquer paradigm and achieves a logarithmic time complexity of O(log n).',
    },
    {
      questionNumber: 3,
      questionText: 'How is the high pointer adjusted when the target value is strictly less than the midpoint element?',
      options: [
        { label: 'A', text: 'Adjusted to midpoint plus one' },
        { label: 'B', text: 'Adjusted to zero' },
        { label: 'C', text: 'Adjusted to midpoint minus one' },
        { label: 'D', text: 'Reset to the length of the array' },
      ],
      correctOption: 'C',
      explanation: 'The notes state: "If the target value is strictly less than the midpoint element, the \'high\' pointer is adjusted to midpoint minus one, discarding the entire upper half of the remaining subarray."',
    },
  ],
};
