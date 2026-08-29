# Tax Action Agent

An ASI:One-discoverable agent that computes an individual's income tax liability
under India's **New Tax Regime (FY 2025-26)** from a natural-language description
of their income, and turns the result into a concrete action plan (advance-tax
schedule, filing deadline, optimization nudge) — not just a number.

Built for [hackathon name] — 10-hour build window, 4-person team.

## Scope (MVP)

- New Regime only. No old-regime comparison.
- Salaried, single-employer income only. No capital gains / business income.
- No real e-filing integration, no OCR/Form-16 upload, no user accounts.

See `API_CONTRACT.md` for the exact request/response shapes — that file is the
source of truth for anyone building against this backend.

## Architecture

```
User → ASI:One → Coordinator Agent (Chat Protocol, registered on Agentverse)
                     ↓ uAgent message
                 Calculator Agent  → tax breakdown
                     ↓ uAgent message
                 Action-Plan Agent → action plan + PDF report

(demo backup, bypasses ASI:One)
Frontend → FastAPI (/api/tax/*) → same tax_rules.py logic
```

## Repo layout

```
tax-action-agent/
├── agents/
│   ├── coordinator_agent.py   # ASI:One-facing, Chat Protocol
│   ├── calculator_agent.py    # tax computation uAgent
│   ├── actionplan_agent.py    # action plan / report uAgent
│   └── common/
│       ├── models.py          # shared Pydantic message schemas — READ THIS FIRST
│       └── tax_rules.py       # FY2025-26 new-regime slab logic (pure functions)
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── routers/tax.py          # REST endpoints, mirrors API_CONTRACT.md
│   └── requirements.txt
├── frontend/
│   ├── src/App.jsx
│   ├── src/api.js              # fetch helpers matching API_CONTRACT.md
│   └── package.json
├── reports/                    # generated PDFs (gitignored)
├── API_CONTRACT.md
└── .env.example
```

## Getting started (everyone, first 30 minutes)

1. Read `agents/common/models.py` — this is the shared contract for agent-to-agent
   messages, same role as `API_CONTRACT.md` but internal. **Do not change field
   names/types without telling the whole team** — everyone builds against these.
2. Read `API_CONTRACT.md` — this is the contract for the frontend ↔ backend REST API.
3. Copy `.env.example` to `.env` and fill in your own values (Agentverse/API keys
   go in yours only, never commit `.env`).

## Who owns what

| Area | Owner | Files |
|---|---|---|
| Backend / tax logic | Backend dev | `agents/common/tax_rules.py`, `backend/` |
| Frontend | Frontend dev | `frontend/` |
| Agents / ASI:One / Agentverse integration | Member 3 | `agents/coordinator_agent.py`, `agents/actionplan_agent.py` |
| Testing / deploy / demo / PDF template | Member 4 | test scripts, Agentverse mailbox setup, demo script |

## Running locally (fill in once implemented)

```bash
# Backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000

# Frontend
cd frontend && npm install && npm run dev

# Agents (each in its own terminal)
python agents/calculator_agent.py
python agents/actionplan_agent.py
python agents/coordinator_agent.py
```

## Useful docs

- uAgents framework: https://uagents.fetch.ai/docs
- ASI:One-compatible agent example: https://uagents.fetch.ai/docs/examples/asi-1
- Agentverse local agent guide: https://docs.agentverse.ai/documentation/create-agents/local-agent-u-agent
