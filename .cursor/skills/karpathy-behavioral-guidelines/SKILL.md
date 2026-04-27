---
name: karpathy-behavioral-guidelines
description: >-
  Behavioral guidelines to reduce common LLM coding mistakes. Use when writing,
  reviewing, or refactoring code to avoid overcomplication, make surgical changes,
  surface assumptions, and define verifiable success criteria. Merge with
  project-specific instructions as needed; bias toward caution over speed—use
  judgment on trivial tasks.
alwaysApply: true
---

# Karpathy behavioral guidelines

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think before coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them—do not pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop, name what is confusing, and ask.

## 2. Simplicity first

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No flexibility or configurability that was not requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask: *Would a senior engineer say this is overcomplicated?* If yes, simplify.

## 3. Surgical changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Do not "improve" adjacent code, comments, or formatting.
- Do not refactor what is not broken.
- Match existing style, even if you would do it differently.
- If you notice unrelated dead code, mention it—do not delete it.

When your changes create orphans:

- Remove imports, variables, or functions that **your** changes made unused.
- Do not remove pre-existing dead code unless asked.

**Test:** Every changed line should trace directly to the user's request.

## 4. Goal-driven execution

**Define success criteria. Loop until verified.**

Turn tasks into verifiable goals, for example:

- "Add validation" → write tests for invalid inputs, then make them pass.
- "Fix the bug" → write a test that reproduces it, then make it pass.
- "Refactor X" → ensure tests pass before and after.

For multi-step work, state a short plan with checks:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria support independent iteration; weak criteria ("make it work") force constant clarification.

## Working definition

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites from overcomplication, and clarifying questions come *before* implementation instead of after mistakes.
