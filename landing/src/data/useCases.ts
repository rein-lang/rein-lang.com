import { flows, type FlowSpec } from "./flows";

export interface UseCase {
  slug: string;
  title: string;
  description: string;
  h1: string;
  teaser: string;
  outcome: string;
  agentSees: string[];
  guarantees: string[];
  flow: FlowSpec;
  flowLabel: string;
  flowCaption: string;
  installCommand?: string;
  source?: { label: string; href: string };
}

export const useCases: UseCase[] = [
  {
    slug: "pull-request-gates",
    title: "Pull request app for AI agents | Rein",
    description:
      "An agent app that approves docs-only pull requests, sends code to review, and waits for CI. Each CI status has a set step.",
    h1: "Approve, review or wait for each pull request",
    teaser: "An app that approves docs changes, sends code to review, and waits on CI.",
    outcome:
      "Docs-only changes are approved at once. Code changes get a review. A red build goes back for a fix. Your agent handles each pull request the same way, every run.",
    agentSees: [
      "The first question is whether the change touches only documentation. If yes, the agent approves the pull request.",
      "If no, the app asks for the CI status. The agent answers with one status from a fixed set. Each status leads to its own step: review the code, fix the build, or wait for CI.",
    ],
    guarantees: [
      "Every answer leads to one step. The agent cannot skip a question.",
      "If your team adds a CI status, rein check reports each place that needs a new step.",
    ],
    flow: flows.pullRequest,
    flowLabel:
      "Diagram. A pull request first asks whether it is docs only. If yes, it is approved. If not, it asks for the CI status and leads to review, a fix, or a wait.",
    flowCaption: "Each question has a yes or no answer, or one answer from a fixed set. Each answer leads to one next step.",
  },
  {
    slug: "incident-triage",
    title: "Incident triage app for AI agents | Rein",
    description:
      "Route each production alert to a person, a runbook, or a ticket. Customer impact is checked first, so urgent alerts reach a person fast.",
    h1: "Route each alert to a person, a runbook, or a ticket",
    teaser: "Send each production alert to a person, a runbook, or a ticket.",
    outcome:
      "Urgent alerts reach a person at once. Known problems get their runbook. Every other alert becomes a ticket, so no alert is left without an owner.",
    agentSees: [
      "The first question is whether customers feel the impact. If yes, the agent pages a person and stops there.",
      "If no, the app asks for the severity. Lower severity leads to one more question: does a runbook exist?",
      "A known runbook sends the agent to follow it. The agent reports whether the alert cleared. If it did not clear, a person is paged. An alert with no runbook becomes a ticket.",
    ],
    guarantees: [
      "Customer impact is checked first, so urgent alerts never wait for later questions.",
      "Each answer has one next step. The agent does not invent a plan.",
    ],
    flow: flows.incidentTriage,
    flowLabel:
      "Diagram. An alert first asks whether customers are hit. If yes, a person is paged. If not, it asks for severity, then whether a runbook exists, and leads to a page, a runbook, or a ticket.",
    flowCaption: "Customer impact is checked first, so the most urgent alerts reach a person without extra steps.",
  },
  {
    slug: "customer-support",
    title: "Customer support app for AI agents | Rein",
    description:
      "Send each support ticket to a help article, a refund step, or a person. VIP tickets go to a person first, and every category has a case.",
    h1: "Answer each ticket, or hand it to a person",
    teaser: "Answer a support ticket, start a refund, or hand it to a person.",
    outcome:
      "Customers get a fast answer for common issues. VIP customers reach a person at once. Billing, how-to and account tickets each go to the right step.",
    agentSees: [
      "The first question is the customer's plan. A VIP ticket goes straight to a person.",
      "Any other ticket gets one question: what is the category? Billing goes to the refund step. How-to goes to a help article. Account goes to a person.",
      "For a help article, the agent sends the link and asks whether it solved the problem. If not, the ticket goes to a person.",
    ],
    guarantees: [
      "Each category has one case, so no ticket falls through.",
      "A help article that does not solve the problem always goes to a person.",
    ],
    flow: flows.customerSupport,
    flowLabel:
      "Diagram. A ticket first asks whether the customer is VIP. If yes, it goes to a person. If not, it asks for the category and leads to escalation, a refund process, or a help article.",
    flowCaption: "The category check has one case per category, so no ticket falls through.",
  },
  {
    slug: "delegating-to-subagents",
    title: "Delegate tasks to subagents by model | Rein",
    description:
      "Give each subagent the model its task needs. Simple tasks get a smaller model, and deep tasks get a larger one, from one fixed template.",
    h1: "Give each subagent the model its task needs",
    teaser: "Delegate each task to a subagent with the model that fits it.",
    outcome:
      "Simple lookups use a smaller model. Hard design questions get a larger one. Every subagent receives the same clear template.",
    agentSees: [
      "The first question is whether the task is simple. A simple task goes to a subagent with a smaller model.",
      "Other tasks get one more question about how much depth they need. The answer picks the middle model or the larger one.",
      "The app fills one template with the model and the task. The agent sends the filled template to the subagent.",
    ],
    guarantees: [
      "Each model choice has one case.",
      "Add a new model choice, and rein check lists each place that still needs a case.",
    ],
    flow: flows.delegation,
    flowLabel:
      "Diagram. A task first asks whether it is simple. If yes, a subagent with a smaller model is used. If not, it asks whether the task needs depth, then picks a middle or larger model.",
    flowCaption: "The model is a choice, not a guess. Each choice leads to one delegation template.",
  },
  {
    slug: "human-in-the-loop",
    title: "Human approval steps for AI agents | Rein",
    description:
      "Let a Rein app ask a person a question, pause until the answer comes, then branch on it. The agent does the steps around that answer.",
    h1: "Ask a person, pause, then act on the answer",
    teaser: "Ask a person a question, wait for the answer, then branch on it.",
    outcome:
      "A person makes the call on risky steps, such as a refund or a release. Your agent does the work around that call, and never guesses the answer.",
    agentSees: [
      "The agent reaches a step that needs a person. The app sends the agent a request, and the run stops there.",
      "The agent asks the person. When the answer comes back, the app continues with that answer.",
      "The answer is typed. A yes or no answer branches the app. A choice from fixed options has its own case for each option.",
    ],
    guarantees: [
      "The run waits at the request. It does not go on until the answer comes.",
      "Typed answers pick each branch, and each option needs its own case.",
    ],
    flow: flows.humanInTheLoop,
    flowLabel:
      "Diagram. The agent sends a request to a person, and the run waits. The answer asks whether the problem is solved. Yes leads to done, and no leads to escalation.",
    flowCaption: "The dashed line marks the wait. The run stops there and continues when the answer arrives.",
  },
  {
    slug: "moscow-prioritization",
    title: "Prioritize a backlog with MoSCoW | Rein",
    description:
      "A Rein app that sorts any backlog into Must, Should, Could and Won't, then writes moscow.md. A script checks that the plan fits the capacity.",
    h1: "Prioritize a backlog with MoSCoW, in one plan",
    teaser: "Sort any list into Must, Should, Could and Won't, and save it as moscow.md.",
    outcome:
      "You get a plan that fits your time box. Each item has a category, an effort and a reason. The plan is written to moscow.md first. You review it there, then approve it, ask for changes, or start over. Starting over deletes moscow.md.",
    agentSees: [
      "The agent collects the items from a file, a link, or a plain list. The first question is whether there are two or more. If not, the app asks for more items.",
      "The user gives the goal, the time box, the capacity and the Must limit. The agent does not set them alone.",
      "A subagent puts each item in a category. A script checks the plan. The question is whether the plan fits the capacity. If not, the user picks the items that move down.",
      "The user approves the plan, asks for changes, or starts over.",
    ],
    guarantees: [
      "A script decides whether the plan fits. The prompt does not.",
      "The agent never drops a Must by itself. The user picks what moves down.",
      "The program writes moscow.md and moscow.tsv to the folder you choose.",
    ],
    flow: flows.moscow,
    flowLabel:
      "Diagram. The app first asks whether there are two or more items. If not, it asks for more items. If yes, it asks whether the plan fits the capacity. A fit goes to review. Otherwise the plan is rebalanced.",
    flowCaption: "Each question has a yes or no answer. Each answer leads to one step.",
    installCommand: "rein install -g github:rein-lang/moscow-prioritization#v0.1.0",
    source: {
      label: "moscow-prioritization on GitHub",
      href: "https://github.com/rein-lang/moscow-prioritization",
    },
  },
  {
    slug: "priority-work",
    title: "Work on top-priority projects first | Rein",
    description:
      "A Rein app that reads your priority list, checks which projects were active, and works on their pull requests. Each answer has a clear step.",
    h1: "Work on your top-priority projects first",
    teaser: "Read the priority list, then work on the active projects' pull requests.",
    outcome:
      "Your agent spends its time on the projects that matter this week. If nothing is active, the agent reports that and does not guess.",
    agentSees: [
      "The first question is whether the workplace has a priority list. Without one, the app reports that and stops.",
      "Next the app asks whether any high-priority repository had activity this week. If none did, the app reports that.",
      "Last, the app asks whether the repositories have open pull requests. If yes, the agent merges them, oldest first. If no, it opens a pull request for the oldest issue.",
    ],
    guarantees: [
      "Each answer leads to one step. The agent cannot skip the activity check.",
      "Finding the projects and working on their pull requests are separate steps.",
    ],
    flow: flows.priorityWork,
    flowLabel:
      "Diagram. The app first asks whether a priority list exists. Then it asks whether a project was active, and whether there are open pull requests. Each answer leads to a report, a merge, or a new pull request.",
    flowCaption: "Each question has a yes or no answer. Each answer leads to one step.",
    source: {
      label: "Example program on the docs site",
      href: "/docs/examples/",
    },
  },
];

export function getUseCase(slug: string): UseCase | undefined {
  return useCases.find((u) => u.slug === slug);
}
