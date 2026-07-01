---
name: review-step
description: Independently review a documented implementation against architecture, acceptance criteria and engineering best practices.
compatibility: opencode
metadata:
  audience: reviewers
  workflow: technical-review
---

# Review Step

Perform an independent technical review of one documented project step.

This skill never modifies code.

Its purpose is to determine whether the implementation satisfies the documented requirements.

---

## When to use

Use this skill whenever the user requests:

- review step X
- validate implementation
- perform code review
- verify architecture
- audit a completed step

Do not use this skill to implement features.

---

## Documentation

Always load:

1. `docs/task.md`
2. `docs/evaluation.md`
3. `docs/steps.md`
4. `docs/steps/<STEP>.md`

Treat documentation as the expected behavior.

---

## Review Workflow

### 1. Read Documentation

Extract:

- objectives
- constraints
- architecture
- acceptance criteria

---

### 2. Inspect the Source Code

Inspect every artifact related to the requested step.

Review:

- modules
- controllers
- services
- entities
- DTOs
- repositories
- migrations
- integrations

---

### 3. Validate Architecture

Confirm that the implementation follows the architecture defined in `evaluation.md`.

Review:

- module organization
- dependency injection
- separation of concerns
- layering
- repository usage
- configuration

---

### 4. Validate Acceptance Criteria

Verify every documented requirement.

Nothing should be assumed.

Every acceptance criterion must be explicitly validated.

---

### 5. Review Engineering Quality

Evaluate:

- SOLID
- Clean Code
- duplication
- naming
- cohesion
- coupling
- error handling
- validation
- maintainability

---

### 6. Review Integrations

Verify:

- external API isolation
- configuration
- retry strategy (if applicable)
- timeout handling
- error handling

---

### 7. Produce a Review Report

Generate:

## Overall Status

Choose one:

- PASS
- PASS_WITH_SUGGESTIONS
- FAIL

---

## Acceptance Criteria

Evaluate every requirement.

Include status and notes.

---

## Findings

Group issues by severity:

- BLOCKER
- CRITICAL
- MAJOR
- MINOR
- SUGGESTION

---

## Technical Debt

List any identified debt.

---

## Recommendations

Suggest improvements ordered by priority.

---

## Final Verdict

Choose one:

- Ready for Production
- Ready with Minor Adjustments
- Requires Refactoring
- Rejected

Support every conclusion with evidence from the documentation and source code.

---

# Review Rules

Always:

- remain objective
- justify findings
- verify against documentation
- prioritize correctness over style

Never:

- modify code
- rewrite files
- invent requirements
- approve undocumented behavior
- ignore acceptance criteria
