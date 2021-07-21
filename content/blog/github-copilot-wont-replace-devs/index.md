---
{
    title: "GitHub Copilot is Amazing - It Won't Replace Developers",
    description: "",
    published: '2021-05-30T22:12:03.284Z',
    authors: ['crutchcorn'],
    tags: ['github copilot', 'tools'],
    attached: [],
    license: 'cc-by-nc-sa-4'
}
---

I recently touched on how GitHub Copilot, an AI-powered code generation tool from GitHub and OpenAI, is going to shift the way we’ll need to do interviews. Copilot frankly is astonishing in its abilities to generate complex algorithm implementations from nothing more than a function name.

Some have taken these advanced algorithm assessment capabilities as a warning sign that developers will soon be fully automated using tech similar to Copilot, I’m not sold on that idea.

# Architecture

Let’s first remember what the job of an engineer or developer is. While on the surface, yes, developers do type code into their IDE - the real work is done in the developer’s mind. To code something is to consider a problem’s expected outcome, its constraints, edge cases, and to take those into account to decide on an implementation.
While Copilot is highly capable of generating *a* solution, it doesn’t know your engineering constraints. This is where architecture decisions come into play. Sure, you may know that you want a sorting algorithm - but *which* sorting algorithm may be more important than being able to implement it. After all, if you are wanting to implement a complex sort on a large dataset with limited memory, your biggest problems are likely to stem from knowing where to store your data in an [external sort](https://en.wikipedia.org/wiki/External_sorting) as opposed to the specific code syntax you’ll utilize to make that a reality.
That said, not every engineer is at or needs to be at an architectural level. Some of us are most comfortable when we can focus within our IDEs as opposed to meeting rooms where those constraints often come to light. However, there is a skill that every developer will need to develop as they code: Debugging.

# Bugs

Even when assisted by a tool like Copilot, bugs are inevitable in any system. Even if your code is perfection itself captured in text, we still have to rely on others code in upstream dependencies. Knowing how to work through finding the root cause and solving a bug is integral to development. Oftentimes, I find myself spending more time debugging complex issues than building a significant portion of fresh code. Regardless of if you use the debugger or print statements (which, we all do at some point, be honest), Copilot isn’t able to automate that process for you.

# Refactors

Likewise, a common task in an existing codebase is to refactor it in order to be more secure, efficient, fast, readable, or otherwise better. While Copilot is able to glean context from the current file you’re presently in, refactors can often span multiple files as you modify the underlying abstractions in a codebase. Even then, while [GitHub says they’re adding support for full project-based context in the future](https://copilot.github.com/#faq-what-context-does-github-copilot-use-to-generate-suggestions), automated refactors would be extremely difficult to attain. 

> When I'm talking about automated refractors, I'm *not* talking about [codemods](https://www.sitepoint.com/getting-started-with-codemods/) powered by AST manipulation to, say, migrate from one version of a library to another. Codemods like those rely on consistent information existing for both versions of the library code being migrated. Further, these codemods don’t come for free and libraries must usually engineer specifically with automated migrations in mind.
>

In order to automate refactors, Copilot would not only need to know how things *were* done, but what the newer method of doing things is. After all, the previous code exists for a reason, what is it doing, why is it doing what it is, and how are we able to improve it? When application-wide refactors occur, a team often sits down and discusses the advantages of standards and sets a level of consistency to strive for. However, refactors often have hidden levels of complexity within. When actually diving into a refactor, there may be constraints in the new technology that may not have been known previously. When this occurs, the team must make decisions based on many parameters. A machine simply isn’t up for the task.

# Code Review

When GitHub Copilot first launched, there was a lot of discussion about how good its generated code would be in the end. Can Copilot understand the nuances in useEffect? Does it know that you need a consistent memory reference to avoid triggering change detection?

Maybe, but you can’t be certain it will get it right every time. However, the same can be said for others: you can’t be certain another person on the team will get it right every time.
This nuance brings another point against the concept of developers being fully automated by Copilot: Code review. 










Further, we’ve had the ability to do something similar for some time now in the form of forum questions. In fact, many have pointed out that this process of looking up code based on its expected constraints is similar to one that a developer might experience by searching StackOverflow for code snippets. Funnily, some thought the idea so similar they decided to build an alternative VSCode plugin to Copilot [that simply looks up StackOverflow answers as suggestions](https://github.com/hieunc229/copilot-clone).









# Copilot’s Strengths
None of this is to say that Copilot as a tool isn’t advantageous 






After all, GitHub’s tool is called “Copilot”, not “Autopilot”



GCP, I love ya, but your suggestion that [humans need not apply](https://www.youtube.com/watch?v=7Pq-S557XQU) isn’t quite here yet. At least not for developers.