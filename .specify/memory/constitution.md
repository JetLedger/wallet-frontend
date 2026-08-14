# JetLedger Project Constitution
CONSTITUTION_VERSION: 1.4.0

> Non-negotiable governing principles. Every spec, plan, task, and implementation
> must be checked against this document. No exceptions.

---

## Principle 1: Spec Before Code

Every feature begins as a spec. No implementation file may be created or modified
before `spec.md` exists and has been explicitly approved.

**This applies regardless of how simple the ticket appears.** A ticket that looks 
like a small addition (e.g. "add idempotent endpoints") can still hide non-obvious 
decisions — key TTL, conflict handling, cached-response semantics — that the spec 
phase exists to surface before code is written. Perceived simplicity is never a 
reason to skip Phase 2 of `.claude/skills/implement-ticket.md`.

Brownfield rule: before writing any logic, search the codebase for existing domain
models, utilities, and patterns. Reuse — do not duplicate.

## Principle 2: Unified Execution Interface
All agents interact with the codebase exclusively through the root Makefile.
Never invoke `./gradlew`, `go test`, `npm run`, or Docker directly.
Commands: `make contracts-gen`, `make test-delta`, `make test-regression`,
`make test-e2e`, `make build-all`, `make up-dev`, `make up-observability`.

## Principle 3: Contract-First for Multi-Repo Changes
Any ticket touching more than one service must modify `wallet-contracts` first
(OpenAPI / AsyncAPI / proto), run `make contracts-gen`, and only then implement
downstream services. Frontend is always last.
Repo order: `wallet-contracts` → `wallet-core` → `wallet-analytics` → `wallet-frontend`

## Principle 4: Isolated Test Authorship
Tests are written by a dedicated subagent (`test-writer`) that reads only `spec.md`
and existing test conventions — never implementation files.
The implementer reads tests but must never modify them.
If a test appears incorrect, the implementer documents it and stops — does not edit.

## Principle 5: Safety Checklist for Financial Logic
Any feature touching monetary values, account state, or transaction records must
address all five items before implementation proceeds:
- Idempotency (safe retry with idempotency keys)
- Concurrency (optimistic locking or DB unique constraint)
- Currency precision (BigDecimal with explicit scale — never float/double)
- Audit trail (userId + correlationId on every state mutation)
- Rollback safety (Liquibase changesets with rollback blocks)
Unclear items → listed as Open Questions in spec. Never assumed.

## Principle 6: Observable by Design
Every business transaction emits structured logs with a correlationId that traverses
all service boundaries.
Sprint 0–1: logs only.
Sprint 3+: OTel metrics (latency + failure rate) required before PR is created.

## Principle 7: Branch and Commit Discipline

**The branch must exist before any file is written — including spec files.** 
Creating a branch after the first commit causes that commit to appear on both 
`main` and the feature branch locally, even if only the feature branch is pushed 
to GitHub. This is the most common git mistake in agentic workflows.

Branch creation happens in **Pre-flight, step 3** of 
`.claude/skills/implement-ticket.md` — before Phase 1 (Jira read) or Phase 2 
(spec-kit) write anything to disk. Not in Phase 8. If you find yourself about 
to write `docs/specs/SCRUM-{id}/spec.md` and have not yet confirmed the branch, 
stop and go back to Pre-flight.

### Mandatory sequence — no exceptions

```bash
git checkout main && git pull origin main
git checkout -b feature/SCRUM-{id}-{slug}
git branch --show-current   # print this output before any file operation
```

The agent must print the output of `git branch --show-current` in its response 
before calling any Write, Edit, or code generation tool — including spec-kit's 
own file writes. If the output is not the expected branch name, all file 
operations are aborted until the branch is correct.

### Naming

- `feature/SCRUM-{id}-{slug}` — new functionality
- `refactor/SCRUM-{id}-{slug}` — no behaviour change
- `fix/SCRUM-{id}-{slug}` — bug fix

### Commit format

```
feat(SCRUM-{id}): {description}
```

### Enforced by `.claude/settings.json` hooks — do not circumvent

- Direct push to `main`/`master` is blocked
- **Any `Write`/`Edit` while on `main`/`master` is blocked** — the hook checks 
  `git branch --show-current` before every file write, not just before push
- Writing to `.env` files is blocked
- Hardcoded credentials trigger a warning

If a hook blocks an operation: do not attempt to work around it or repeat the 
same command. Fix the underlying condition (create/switch branch) and retry.

If push to main is blocked: use `git cherry-pick` to move commits to the feature 
branch, then push the feature branch.

### Multi-repo tickets

One branch per repo, same name. PRs cross-linked. Merge contracts repo first, 
then dependent services.

### Recovery when commit landed on main locally

```bash
git checkout feature/SCRUM-{id}-{slug}  # confirm commits are here
git checkout main
git reset --hard origin/main             # safe if main was never pushed wrong
```

## Principle 8: Jira Lifecycle Ownership
The agent owns Jira status transitions and comments throughout the cycle.
In Progress → when spec is approved.
In Review → when PR is created (with PR URLs in comment).
Done → only after human reviewer approves and merges.
CodeRabbit reviews every PR automatically — do not create a separate review subagent.

## Principle 9: Spec Artifacts Are Committed
All spec artifacts live in `docs/specs/SCRUM-{id}/` and are committed alongside code.
They serve as persistent decision history, not ephemeral scratch files.
Files per ticket: `spec.md`, `plan.md`, `tasks.md`, `jira-context.md`, `tests.md`, 
`implementation.md`, `pr.md`. A ticket is not complete if any of these is missing.

**For multi-repo tickets, each affected repo has its own 
`docs/specs/SCRUM-{id}/` directory, scoped to that repo's own 
responsibilities only.** Specs do not live in `jetledger-workspace` (the 
orchestrator/tooling workspace, not a product code repository) — a spec not 
committed alongside the code it describes fails the "committed alongside 
code" requirement above by definition. There is no single "primary" repo 
that holds the canonical spec for a multi-repo ticket; each repo's spec is 
self-contained and travels with that repo. Cross-repo dependencies are 
referenced by name (e.g. "consumes events published by wallet-core") without 
restating the other repo's internal design — see Principle 3 for the scope 
boundary this implies, and the SCRUM-3 history (two CodeRabbit rounds needed 
to separate wallet-core's spec from wallet-analytics' responsibilities) for 
why this matters in practice.

## Principle 10: Phased Observability Activation
Phase 4 of the validator (OTel + Grafana) is skipped until Sprint 3.
E2E Playwright tests are skipped until Sprint 2.
Validator must not fail on skipped phases — it reports SKIPPED, not FAILED.

## Principle 11: Dependency Family Consistency

When adding a new import, it must match the package family already established 
in the project for that concern — do not mix equivalent libraries from different 
sources in the same module without understanding which one is actually correct.

**Jackson in this project — Spring Boot 4 / Jackson 3 namespace rule (verified, do not reverse):**

- `ObjectMapper`, `JsonMapper`, `JacksonException`, and other Jackson processing 
  classes → `tools.jackson.*` (Jackson 3 engine, Spring Boot 4's default)
- `@JsonProperty`, `@JsonIgnore`, `@JsonCreator`, and other annotations → 
  `com.fasterxml.jackson.annotation.*` (unchanged — `jackson-annotations` stays 
  on the legacy namespace intentionally, for backward compatibility across the 
  ecosystem; this is correct, not a migration gap)

If a CodeRabbit or other automated review suggests reversing `tools.jackson.*` 
imports back to `com.fasterxml.jackson.databind`/`com.fasterxml.jackson.core` — 
this is incorrect for this project and must not be applied. `tools.jackson.*` 
is the correct, real, GA-released (October 2025) Jackson 3 package — not a 
typo or a non-existent package. Verified against jackson-databind 3.0.0 
javadoc (javadoc.io) and the official FasterXML Jackson 3 migration guide.

**This finding has already recurred across multiple CodeRabbit review rounds 
on this project** (it does not retain memory between rounds and does not 
appear to know Jackson 3 GA exists). If it appears again — including phrased 
as "not a standard package" or "will cause compilation failure" — treat it as 
already answered: do not re-investigate from scratch, do not apply, briefly 
note in the PR/commit that this is the known recurring false positive per 
this principle.

## Principle 12: Spec Stays Synchronized With Code After Every Fix Round

A spec is not a one-time artifact written before code and then frozen. When a 
fix round (CodeRabbit findings, manual review, bug fix) changes an interface, 
contract, or design decision that `spec.md`/`plan.md`/`tasks.md` describe, the 
same PR that applies the fix must also update those spec files. A spec that no 
longer matches the code it documents is worse than no spec — it actively 
misleads the next person (or agent) who reads it as decision history.

This has concretely happened once already on SCRUM-2: implementation came 
first (no spec), then a retroactive spec was generated describing the 
original `get(UUID)/store(UUID, record)` `IdempotencyService` design, then a 
CodeRabbit round hardened it to an atomic `claim()/storeResult()` design with 
a composite `IdempotencyKey` — but the spec was not updated to match. A 
second CodeRabbit-adjacent review caught the drift. Do not let a third round 
repeat this.

**Checklist before closing out any fix round:**
- [ ] Did this fix change a method signature, interface, or data model that 
      spec.md describes? → update spec.md in the same commit
- [ ] Did this fix change the task breakdown's assumptions? → update tasks.md
- [ ] Did this fix change the architecture/data-flow diagrams in plan.md? → 
      update plan.md
- [ ] If spec.md was generated retroactively (implementation preceded spec), 
      its retroactive-note header must also note the most recent reconciliation 
      date/reason, not just the original gap

This applies regardless of how many fix rounds a ticket has already been 
through — the first commit without a spec, the retroactive spec, the first 
CodeRabbit fix, and every subsequent one are all subject to this principle 
going forward.
