import { flows, type FlowSpec } from "./flows";

export interface UseCase {
  slug: string;
  title: string;
  description: string;
  h1: string;
  teaser: string;
  paragraphs: string[];
  flow: FlowSpec;
  flowLabel: string;
  flowCaption: string;
}

export const useCases: UseCase[] = [
  {
    slug: "pull-request-gates",
    title: "Pull request gates for agents | Rein",
    description:
      "See how Rein lets an agent decide whether a pull request merges, goes to review, or waits for CI. Every case is handled, with no silent fallback.",
    h1: "Decide the next step for each pull request",
    teaser: "Decide whether a pull request merges, gets a review, or waits for CI.",
    paragraphs: [
      "A pull request can take several paths. A docs-only change can merge at once. A code change needs a review. A red build needs a fix. A pending build means the agent waits.",
      "In Rein, the first decision asks one question: does this change touch only documentation? Each answer leads to a different next step. The agent answers from what it sees in the pull request.",
      "CI status is a fixed set of options. Each option gets its own case. If the team adds a new status, the checker reports the gap until someone writes what the agent does next.",
      "Security-sensitive changes can move to a review step with a stricter focus. Pointers keep each rule in its own file, so one rule can change without touching the others.",
    ],
    flow: flows.pullRequest,
    flowLabel:
      "Diagram. A pull request first asks whether it is docs only. If yes, it is approved. If not, it asks for the CI status and leads to review, a fix, or a wait.",
    flowCaption: "Each question has a yes or no answer, or one answer from a fixed set. Each answer leads to one next step.",
  },
  {
    slug: "incident-triage",
    title: "Incident triage for agents | Rein",
    description:
      "Learn how Rein routes a new production alert to a person, a known runbook, or a ticket. Each path ends in one clear next step.",
    h1: "Route each alert to one clear next step",
    teaser: "Route a production alert to a person, a runbook, or a ticket.",
    paragraphs: [
      "An alert can mean very different things. Customers may feel it now. The severity sets how urgent it is. A runbook may already cover the problem.",
      "The first question is whether customers feel the impact. If they do, the alert goes to a person at once. If not, the flow asks about severity.",
      "Lower-severity alerts ask one more question: does a runbook exist? A known runbook sends the agent to follow it and report whether the alert cleared. If it did not clear, a person is paged. An unknown alert becomes a ticket.",
      "Each outcome names its next step. The agent does not invent a plan, and no path leaves an alert without an answer.",
    ],
    flow: flows.incidentTriage,
    flowLabel:
      "Diagram. An alert first asks whether customers are hit. If yes, a person is paged. If not, it asks for severity, then whether a runbook exists, and leads to a page, a runbook, or a ticket.",
    flowCaption: "Customer impact is checked first, so the most urgent alerts reach a person without extra steps.",
  },
  {
    slug: "customer-support",
    title: "Customer support flows for agents | Rein",
    description:
      "See how Rein sends a support ticket to a help article, a refund flow, or a person. VIP tickets and every ticket category have a defined case.",
    h1: "Answer tickets, or hand them to a person",
    teaser: "Answer a support ticket, start a refund, or hand it to a person.",
    paragraphs: [
      "Support tickets come in many shapes. Some need a help article. Some need a refund. Some need a person who can decide. A flow for them must say which is which.",
      "The first question is about the customer's plan. VIP customers go straight to a person. Everyone else gets a question about the ticket's category.",
      "Each category has one case. A billing ticket goes to the refund flow. A how-to ticket goes to a help article. An account ticket goes to a person.",
      "For a help article, the agent sends the link and asks the customer whether it solved the problem. If the answer is no, the ticket goes to a person.",
    ],
    flow: flows.customerSupport,
    flowLabel:
      "Diagram. A ticket first asks whether the customer is VIP. If yes, it goes to a person. If not, it asks for the category and leads to escalation, a refund flow, or a help article.",
    flowCaption: "The category check has one case per category, so no ticket falls through.",
  },
  {
    slug: "delegating-to-subagents",
    title: "Delegating to subagents by model | Rein",
    description:
      "Learn how Rein picks a model for each task before the agent delegates it to a subagent. Each task size gets a defined case, and the template is standard.",
    h1: "Pick the right model for each delegated task",
    teaser: "Delegate each task to a subagent, with the model that fits it.",
    paragraphs: [
      "Not every task needs the largest model. A simple lookup can go to a smaller model. A hard design question may need the largest one. Choosing the model is a decision, so Rein writes it as a flow.",
      "The first question asks whether the task is simple. A simple task goes to a subagent with a smaller model. Other tasks ask one more question about how much reasoning they need.",
      "Delegation uses a template. A template is text with slots, such as the model and the task. The flow fills the slots, and the agent sends the result to a subagent.",
      "Each model choice has a case. Add a new option, and the checker reports every place that still needs a case.",
    ],
    flow: flows.delegation,
    flowLabel:
      "Diagram. A task first asks whether it is simple. If yes, a subagent with a smaller model is used. If not, it asks whether the task needs depth, then picks a middle or larger model.",
    flowCaption: "The model is a choice, not a guess. Each choice leads to one delegation template.",
  },
  {
    slug: "human-in-the-loop",
    title: "Human-in-the-loop requests for agents | Rein",
    description:
      "See how a Rein flow asks a person a question, waits for the answer, and branches on it. The run stops at the request and restarts with the answer.",
    h1: "Ask a person, wait, then branch on the answer",
    teaser: "Ask a person a question, wait for the answer, then branch on it.",
    paragraphs: [
      "Some steps need a person. The agent should not decide alone whether a refund is fair, or whether a change can ship. Rein lets a flow send the agent a request and wait for a typed answer.",
      "The run stops at the request. The agent asks the person, then the flow starts again with the answer. No state is kept between runs, so the flow restarts with the answer it gets.",
      "The answer is typed, like any other input. A yes or no answer branches the flow. A choice among fixed options branches it again, and every option has its own case.",
      "This keeps the person in control of the decision, and the agent in control of the steps around it.",
    ],
    flow: flows.humanInTheLoop,
    flowLabel:
      "Diagram. The agent sends a request to a person, and the run waits. The answer asks whether the problem is solved. Yes leads to done, and no leads to escalation.",
    flowCaption: "The dashed line marks the wait. The run stops there and restarts when the answer arrives.",
  },
];

export function getUseCase(slug: string): UseCase | undefined {
  return useCases.find((u) => u.slug === slug);
}
