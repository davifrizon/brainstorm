export const IDEA_PROMPTS = [
  "What could we build this weekend?",
  "What's a terrible business that would somehow work?",
  "How could we make school less boring?",
  "What would we build with unlimited money?",
  "What's a chore we could automate together?",
  "If we started a podcast, what would it be about?",
  "What app do we keep wishing existed?",
  "What's the dumbest superpower that's secretly the best?",
  "What trip could we plan for under $200?",
  "What game would we invent for a rainy day?",
  "What's a skill we could all learn in a month?",
  "What would our dream clubhouse look like?",
  "What's a small thing that would make everyone's week better?",
  "If we opened a restaurant, what's the one dish it's known for?",
  "What's a myth about our friend group we should turn into merch?",
  "What could we prototype in a single afternoon?",
  "What's a competition we could run this month?",
  "What would make our next hangout unforgettable?",
];

export function randomIdeaPrompt(exclude?: string): string {
  const pool = exclude
    ? IDEA_PROMPTS.filter((p) => p !== exclude)
    : IDEA_PROMPTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
