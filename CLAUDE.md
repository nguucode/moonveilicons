## Agent skills

### Issue tracker

Issues live in GitHub Issues on `nguucode/moonveilicons`, using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical label names (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Vault (memory)

Durable knowledge for this project lives in the Obsidian vault **ontheshore**, not in this repo and not in chat:
`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/ontheshore`

- Before non-trivial work, read the vault's `CLAUDE.md` and follow its read order (starts with `_system/context/governance.md`; design or front-end work also reads `_system/context/design-system.md`).
- Product decisions, research, briefs, and non-code output go to `10-projects/moonveilicons/` in the vault if that folder exists, otherwise `00-inbox/`. Follow the vault's write rules (frontmatter, agent-log).
- Docs that ship with the code (README, ADRs, CONTEXT.md, docs/) stay in this repo. Do not copy them into the vault.
