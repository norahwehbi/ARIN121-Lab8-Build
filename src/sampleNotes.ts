export interface SampleNote {
  title: string;
  topic: string;
  content: string;
}

export const SAMPLE_NOTES: SampleNote[] = [
  {
    title: 'Cellular Respiration & ATP',
    topic: 'Biology',
    content: `Cellular respiration is the biochemical process by which eukaryotic cells convert glucose and oxygen into usable adenosine triphosphate (ATP), releasing carbon dioxide and water as byproducts. 

The overall pathway consists of three distinct stages:
1. Glycolysis takes place in the cytosol and does not require oxygen. In this initial breakdown, one 6-carbon glucose molecule is split into two 3-carbon molecules of pyruvate, yielding a net gain of 2 ATP and 2 NADH.
2. The Citric Acid Cycle (also known as the Krebs Cycle) occurs inside the mitochondrial matrix. Each pyruvate is first oxidized to Acetyl-CoA before entering the cycle. Through a series of redox reactions, the cycle produces 2 ATP, 6 NADH, and 2 FADH2 per original glucose molecule, while releasing carbon dioxide.
3. Oxidative Phosphorylation is localized across the inner mitochondrial membrane and accounts for the vast majority of ATP synthesis. Electrons transferred from NADH and FADH2 pass through an electron transport chain, pumping protons into the intermembrane space to generate an electrochemical gradient. Protons flow back down this gradient through ATP synthase, yielding approximately 26 to 28 molecules of ATP. Oxygen acts as the final electron acceptor, forming water. Under ideal conditions, one glucose molecule yields roughly 30 to 32 net ATP in total.`,
  },
  {
    title: 'The Roman Republic & Senate',
    topic: 'History',
    content: `The Roman Republic was established in 509 BCE following the expulsion of Lucius Tarquinius Superbus, the last king of Rome. Rather than investing absolute power in a monarch, the Romans developed a complex constitution centered on shared governance, term limits, and checks on individual power.

Executive authority was held by two Consuls, who were elected annually by the Centuriate Assembly. The Consuls commanded the military legions, presided over public assemblies, and carried supreme civil authority, but each Consul held veto power over the decisions of the other. In moments of severe military crisis, the Senate could nominate a Dictator with singular command, but this emergency office was strictly limited to a maximum term of six months.

The Roman Senate was an unelected advisory council composed primarily of patricians and former magistrates who served for life. Although the Senate did not formally pass laws during the Republic—legislation was technically voted upon by the citizen assemblies—its control over state finances, foreign diplomacy, provincial assignments, and religious matters gave it immense de facto authority. To protect the interests of the common plebeians against patrician overreach, the office of Tribune of the Plebs was established, granting tribunes the power of sacrosanctity and the right to veto legislative acts.`,
  },
  {
    title: 'Binary Search Algorithm',
    topic: 'Computer Science',
    content: `Binary search is an efficient search algorithm designed to locate a target value within a sorted array. Unlike linear search, which inspects elements sequentially with an O(n) worst-case time complexity, binary search operates on the divide-and-conquer paradigm and achieves a logarithmic time complexity of O(log n).

The prerequisite condition for binary search is that the collection must be monotonically sorted in ascending or descending order prior to executing the search. The algorithm initializes two index pointers: 'low' at the start of the array and 'high' at the final element. In each step, it calculates the midpoint index. If the element at the midpoint matches the target, the search successfully terminates. If the target value is strictly less than the midpoint element, the 'high' pointer is adjusted to midpoint minus one, discarding the entire upper half of the remaining subarray. Conversely, if the target is greater than the midpoint element, the 'low' pointer is adjusted to midpoint plus one, eliminating the lower half. 

The iterative execution continues until either the target is identified or the 'low' pointer surpasses the 'high' pointer, which indicates that the target is not present in the collection. The iterative implementation requires O(1) auxiliary space, making it both time-efficient and memory-efficient.`,
  },
];
