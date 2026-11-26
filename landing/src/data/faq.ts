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
      "Rein is a small, strict language for AI agent programs. A program is an app for an agent. It asks typed questions one at a time. Each answer leads to the next step or to an instruction. Rein is in beta.",
    link: { href: "/docs/", label: "Read the introduction" },
  },
  {
    question: "How does an agent run a Rein program?",
    answer:
      "The agent steps the program one answer at a time. Each step returns a question, a request, a final instruction, or an error. The agent calls rein step from a shell, or uses rein serve --mcp to get the program as MCP tools.",
    link: { href: "/docs/reference/interface", label: "See the agent interface" },
  },
  {
    question: "How is a Rein program different from a skill?",
    answer:
      "A skill is a manual. The agent reads all of it and decides each step itself. A Rein program is an app. It asks the agent one question at a time and gives the next step, so no step is skipped. Most projects use both: a program step can name a skill to use.",
    link: { href: "/docs/rein-vs-skills", label: "Compare Rein and skills" },
  },
  {
    question: "How does my agent find my programs?",
    answer:
      "Install a program with rein install -g <package>. Rein's agent hook gives the agent the list of installed programs, like a home screen. The agent starts the program that matches its task. Run rein list to see the same list.",
    link: { href: "/docs/reference/cli-agents", label: "Read the agent hook reference" },
  },
  {
    question: "Why not write agent programs in TypeScript or Python?",
    answer:
      "A Rein program decides, it does not compute. Rein looks like TypeScript but does only decision trees. The checker knows every path before a run, and a Rein program runs no code on your machine. The agent does the work.",
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
