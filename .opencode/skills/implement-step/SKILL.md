---
name: implement-step
description: Validate, plan and implement a single documented project step following the project architecture and acceptance criteria.
compatibility: opencode
metadata:
  audience: backend-engineers
  workflow: step-driven-development
---

# Implement Step

Implement exactly one documented project step.

This skill is responsible for validating the current implementation, planning the work, implementing the requested step, and producing an implementation report.

This skill **does not perform an independent code review**.

---

## When to use

Use this skill whenever the user requests:

- implement step X
- execute step X
- continue implementation
- implement a documented feature
- build the next project milestone

Do not use this skill for code review or architecture audits.

---

## Project Documentation

Treat the documentation as the single source of truth.

Always load, in order:

1. `docs/task.md`
2. `docs/evaluation.md`
3. `docs/steps.md`
4. `docs/steps/<STEP>.md`

If documentation conflicts exist, prefer the most specific document.

Priority:

```
Step Documentation
    >
Project Steps
    >
Evaluation
    >
Task
```

---

## Workflow

Always execute the following workflow.

### 1. Understand the Step

Read all required documentation.

Extract:

- objectives
- constraints
- acceptance criteria
- architecture requirements

Do not generate code.

---

### 2. Inspect the Project

Inspect the current implementation.

Determine:

- existing modules
- entities
- services
- repositories
- DTOs
- controllers
- migrations
- integrations

Never assume something is missing.

---

### 3. Perform Gap Analysis

Compare documentation against implementation.

Determine:

- already implemented
- partially implemented
- missing
- incorrect
- outside current scope

Assign one status:

- NOT_STARTED
- PARTIALLY_IMPLEMENTED
- COMPLETED
- INVALID

If COMPLETED:

Stop.

Explain why.

Do not reimplement.

---

### 4. Build an Implementation Plan

Before writing code:

Produce a plan containing:

- files to create
- files to modify
- migrations
- modules
- endpoints
- DTOs
- services
- repositories
- integrations

Wait for explicit user confirmation.

Never skip this step.

---

### 5. Implement

After confirmation:

Implement only the requested scope.

Do not anticipate future steps.

Prefer extending existing code instead of replacing it.

Avoid duplicated implementations.

---

### 6. Validate

Verify:

- compilation
- dependency injection
- module registration
- migrations
- DTO validation
- acceptance criteria

---

### 7. Report

Produce:

- implementation status
- created files
- modified files
- completed acceptance criteria
- remaining work
- technical debt (if any)

---

# Engineering Rules

Always:

- Follow NestJS best practices
- Follow SOLID
- Follow Clean Architecture
- Use TypeORM migrations
- Keep Controllers thin
- Keep Services responsible for business rules
- Isolate external APIs behind Gateways or Clients
- Reuse existing code

Never:

- use `synchronize=true`
- duplicate code
- modify unrelated modules
- skip validation
- implement undocumented features
- move to another step before finishing the current one
