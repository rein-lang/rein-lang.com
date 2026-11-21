### Calls with return

A function can run another function and use its result as a value. The answer is a `const`, as for `request`. The value after `await` is a reference:

```ts
import { open_prs } from "./work/open_prs";
import { main } from "priority-projects";

interface Projects {
  /**
   * The high priority repositories (`owner/name`), comma-separated,
   * or `-`.
   */
  repos: string;
  /** Did priority-projects find no repository? */
  none: boolean;
}

/** Work on the high priority projects of a workplace. */
export default async function work(
  /** The workplace folder that lists the projects. */
  workplace: string,
) {
  /** The high priority repositories. */
  const projects: Projects = await main(workplace=workplace);

  if (projects.none) {
    return `No priority project has activity.`;
  }

  return open_prs(repos=projects.repos);
}
```

- The forms are `await name(args)` and `await name` with no arguments. The target is any hand-off target: an imported function (`import { fix } from "./ci/fix";`), `@program`, or `@program/function`. The argument rules are the rules of a hand-off (section 4, Inputs). Every `string` parameter of the target is given by name, once. A `boolean` or union parameter may be passed too, and then the target does not ask for it. A target with no parameters takes no arguments.
- The doc comment and type rules are the rules of a `request` answer (section 4, Async requests): a doc comment, and a `boolean`, union or struct type. `await` needs `export default async function`.
- The target must be a function. A template gives text, not a run: `` `@./tpl` is a template; only a function can be awaited ``. A target that does not resolve gives the errors of a hand-off. A program target follows the `package.json` rule and targets only the entry of the program (section 4, References).
- `await REF` outside a `const` answer is an error: `` `await` gives an answer; write `/** question */ const name: Type = await @program(...);`, then read `name` ``.
- `rein step` walks the target as a hand-off. Its questions and requests have the target's keys after the caller's answer key and `>`, such as `work.projects>@priority-projects/main.has_list` (section 11). Each call has its own keys, so two calls of one function, or each level of a recursive call, ask their questions again. A hand-off inside it is followed. When the target ends with text, the run does not end: the next step is a request for the `const` (section 11). When the `const` has an answer, the function goes on after the `await`.
- A target may itself use `await`. The innermost `await` is answered first.
