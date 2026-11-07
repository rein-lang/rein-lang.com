// Abstract flow diagrams, drawn as inline SVG. Labels are plain words, never code.
// Layout: a source card on the left, question pills in the middle, outcomes on the right.

export interface CardNode {
  type: "card";
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines: number;
}

export interface PillNode {
  type: "pill";
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  variant: "question" | "outcome";
  icon?: "check";
}

export interface EdgeSpec {
  d: string;
  accent?: boolean;
  dashed?: boolean;
  label?: { text: string; x: number; y: number };
}

export interface FlowSpec {
  id: string;
  width: number;
  height: number;
  nodes: (CardNode | PillNode)[];
  edges: EdgeSpec[];
}

const card = (title: string, lines = 4): CardNode => ({
  type: "card",
  x: 8,
  y: 70,
  w: 150,
  h: 160,
  title,
  lines,
});

const question = (text: string, y: number, x = 190): PillNode => ({
  type: "pill",
  x,
  y,
  w: 160,
  h: 54,
  text,
  variant: "question",
});

const outcome = (text: string, y: number, icon?: "check"): PillNode => ({
  type: "pill",
  x: 384,
  y,
  w: 168,
  h: 54,
  text,
  variant: "outcome",
  icon,
});

const W = 560;
const H = 300;

// Pull request: docs-only check, then CI status.
const pullRequest: FlowSpec = {
  id: "pull-request",
  width: W,
  height: H,
  nodes: [
    card("Pull request"),
    question("Docs only?", 24),
    question("CI status?", 123),
    outcome("Approve", 12, "check"),
    outcome("Review code", 88),
    outcome("Fix the build", 164),
    outcome("Wait for CI", 240),
  ],
  edges: [
    { d: "M158 150 C174 150 174 51 190 51" },
    { d: "M350 51 C366 51 366 37 384 37", accent: true, label: { text: "yes", x: 354, y: 68 } },
    { d: "M270 78 L270 123", label: { text: "no", x: 278, y: 104 } },
    { d: "M350 150 C366 150 366 113 384 113" },
    { d: "M350 150 C366 150 366 189 384 189" },
    { d: "M350 150 C366 150 366 265 384 265" },
  ],
};

// Incident triage: customer impact, then severity, then runbook.
const incidentTriage: FlowSpec = {
  id: "incident-triage",
  width: W,
  height: H,
  nodes: [
    card("Alert"),
    question("Customers hit?", 24),
    question("Severity?", 123),
    question("Runbook?", 222),
    outcome("Page a human", 24),
    outcome("Follow runbook", 123),
    outcome("Open ticket", 222),
  ],
  edges: [
    { d: "M158 150 C174 150 174 51 190 51" },
    { d: "M350 51 L384 51", accent: true, label: { text: "yes", x: 352, y: 40 } },
    { d: "M270 78 L270 123", label: { text: "no", x: 278, y: 104 } },
    { d: "M350 150 C362 150 362 51 384 51" },
    { d: "M270 177 L270 222" },
    { d: "M350 249 C372 249 372 150 384 150" },
    { d: "M350 249 L384 249" },
  ],
};

// Customer support: VIP check, then ticket category.
const customerSupport: FlowSpec = {
  id: "customer-support",
  width: W,
  height: H,
  nodes: [
    card("Ticket"),
    question("VIP plan?", 24),
    question("Category?", 123),
    outcome("Escalate", 24),
    outcome("Refund flow", 123),
    outcome("Help article", 222),
  ],
  edges: [
    { d: "M158 150 C174 150 174 51 190 51" },
    { d: "M350 51 L384 51", accent: true, label: { text: "yes", x: 352, y: 40 } },
    { d: "M270 78 L270 123", label: { text: "no", x: 278, y: 104 } },
    { d: "M350 150 C362 150 362 51 384 51" },
    { d: "M350 150 L384 150" },
    { d: "M350 150 C372 150 372 249 384 249" },
  ],
};

// Delegation: task size decides the model for the subagent template.
const delegation: FlowSpec = {
  id: "delegation",
  width: W,
  height: H,
  nodes: [
    card("Task"),
    question("Simple task?", 24),
    question("Needs depth?", 123),
    outcome("Smaller model", 24),
    outcome("Middle model", 123),
    outcome("Larger model", 222),
  ],
  edges: [
    { d: "M158 150 C174 150 174 51 190 51" },
    { d: "M350 51 L384 51", accent: true, label: { text: "yes", x: 352, y: 40 } },
    { d: "M270 78 L270 123", label: { text: "no", x: 278, y: 104 } },
    { d: "M350 150 L384 150" },
    { d: "M350 150 C372 150 372 249 384 249" },
  ],
};

// Human in the loop: the agent sends a request, the run waits, then branches on the answer.
const humanInTheLoop: FlowSpec = {
  id: "human-in-the-loop",
  width: W,
  height: H,
  nodes: [
    card("Agent"),
    { type: "card", x: 190, y: 70, w: 160, h: 160, title: "Ask a person", lines: 3 },
    question("Solved?", 123, 384),
    outcome("Done", 24, "check"),
    outcome("Escalate", 222),
  ],
  edges: [
    { d: "M158 150 L190 150" },
    { d: "M350 150 L384 150", dashed: true },
    { d: "M468 123 L468 78", accent: true, label: { text: "yes", x: 476, y: 104 } },
    { d: "M468 177 L468 222", label: { text: "no", x: 476, y: 204 } },
  ],
};

// Two moves in the body: branch on a yes or no, or pick one case.
const twoMoves: FlowSpec = {
  id: "two-moves",
  width: W,
  height: H,
  nodes: [
    card("Decision"),
    question("Yes or no?", 24),
    question("Pick a case", 123),
    outcome("Instruction", 24),
    outcome("Pointer", 123),
    outcome("Template", 222),
  ],
  edges: [
    { d: "M158 150 C174 150 174 51 190 51" },
    { d: "M350 51 L384 51", accent: true, label: { text: "yes", x: 352, y: 40 } },
    { d: "M270 78 L270 123", label: { text: "no", x: 278, y: 104 } },
    { d: "M350 150 L384 150" },
    { d: "M350 150 C372 150 372 249 384 249" },
  ],
};

// Home hero: abstract only. No scenario words, so the home page shows no example.
const hero: FlowSpec = {
  id: "hero",
  width: W,
  height: H,
  nodes: [
    card("Decision"),
    question("Yes or no?", 24),
    question("Pick one", 123),
    outcome("Instruction", 24),
    outcome("Template", 123),
    outcome("Next decision", 222),
  ],
  edges: [
    { d: "M158 150 C174 150 174 51 190 51" },
    { d: "M350 51 L384 51", accent: true, label: { text: "yes", x: 352, y: 40 } },
    { d: "M270 78 L270 123", label: { text: "no", x: 278, y: 104 } },
    { d: "M350 150 L384 150" },
    { d: "M350 150 C372 150 372 249 384 249" },
  ],
};

export const flows = {
  hero,
  pullRequest,
  incidentTriage,
  customerSupport,
  delegation,
  humanInTheLoop,
  twoMoves,
};
