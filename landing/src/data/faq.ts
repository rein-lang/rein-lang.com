// Questions on the home page. The same text is the FAQPage JSON-LD, so search and AI answers quote the page.
export interface Faq {
  question: string;
  answer: string;
  link?: { href: string; label: string };
}

export const faqs: Faq[] = [
  {
    question: "What is Rein?",
    answer:
      "Rein is a small, strict language for the decisions an AI agent makes. Each decision is a function in its own file. A function asks the agent typed questions, and each answer leads to an instruction or to the next function. Rein is in alpha.",
    link: { href: "/docs/", label: "Read the introduction" },
  },
  {
    question: "How does an agent run a Rein program?",
    answer:
      "The agent steps the program one answer at a time. Each step returns a question, a request, a final instruction, or an error. The agent calls rein step from a shell, or uses rein serve --mcp to get the program as MCP tools.",
    link: { href: "/docs/reference/interface", label: "See the agent interface" },
  },
  {
    question: "How is Rein different from an agent skill?",
    answer:
      "A skill gives the agent knowledge as text, and the agent decides each step itself. A Rein process gives the agent the next step, from the agent's answers. Most projects use both.",
    link: { href: "/docs/rein-vs-skills", label: "Compare Rein and skills" },
  },
  {
    question: "Why not write agent processes in TypeScript or Python?",
    answer:
      "A process decides, it does not compute. Rein looks like TypeScript but does only decision trees. The checker knows every path before a run, and a Rein program runs no code on your machine. The agent does the work.",
    link: { href: "/docs/why-not-a-programming-language", label: "Why Rein is its own language" },
  },
  {
    question: "What does the Rein checker find?",
    answer:
      "The rein check command reports a switch with no case for an answer, a case that does not end in a return, and a reference to a function that does not exist. It finds these gaps before an agent runs the process.",
    link: { href: "/docs/reference/spec", label: "Read the language reference" },
  },
  {
    question: "Is Rein free and open source?",
    answer:
      "Yes. Rein is free and open source under the MIT license. The language, the checker and the rein command line tool are on GitHub.",
    link: { href: "https://github.com/rein-lang/rein", label: "rein-lang/rein on GitHub" },
  },
];

// The answer as the page shows it, with its link label, for FAQPage JSON-LD.
export const faqText = (faq: Faq) => (faq.link ? `${faq.answer} ${faq.link.label}.` : faq.answer);
