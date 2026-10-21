# 🤖 School Management System — Agent Guide

This folder contains the persistent definitions for all AI agents used in this project.
Each agent file holds the full system prompt and phase checklist.

## Agents

| File | Agent | Role | Domain |
|------|-------|------|--------|
| [fe_agent.md](./fe_agent.md) | `sms_fe_agent` | Frontend React Developer | `frontend/` |
| [be_agent.md](./be_agent.md) | `sms_be_agent` | Backend Django Developer | `backend/` |
| [deploy_agent.md](./deploy_agent.md) | `sms_deploy_agent` | DevOps Engineer | `deploy/` |
| [test_agent.md](./test_agent.md) | `sms_test_agent` | QA & Testing Engineer | `backend/tests/`, `frontend/src/__tests__/` |

---

## How Agents Work

Agents are AI sub-workers that you invoke inside a chat session.
They are **not permanently stored in memory** — they must be **re-defined** at the start of each new chat.
These markdown files solve that problem by storing the definitions permanently in the project.

---

## How to Restore Agents in a New Chat

### Option A — Gemini (Antigravity / Google)
1. Open Antigravity in a new chat
2. Tell it: *"Read `docs/agents/fe_agent.md` and re-define the `sms_fe_agent` from the system prompt in that file"*
3. It will use `define_subagent` to restore the agent instantly
4. Repeat for `be_agent.md` and `deploy_agent.md` as needed

### Option B — Claude (Anthropic)
1. Open a Claude Project
2. Copy the system prompt block from the relevant `.md` file
3. Paste it as the Project System Prompt
4. Claude will now behave as that specialized agent

---

## Project Chat Assignments

This project uses **dedicated chats** per domain:

| Chat Purpose | Agents Used |
|---|---|
| FE Chat (this chat) | `sms_fe_agent` |
| BE Chat | `sms_be_agent` |
| Deploy Chat | `sms_deploy_agent` |
| Testing Chat | `sms_test_agent` |
| Planning Chat | All 4 for coordination |

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite (JavaScript) |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| API Client | Axios + TanStack Query v5 |
| Backend | Python + Django REST Framework |
| Auth | JWT (djangorestframework-simplejwt) |
| Database | PostgreSQL |
| Task Queue | Celery + Redis (optional) |
| AI / LLM | Provider TBD |
| Deployment | Docker + Docker Compose + Nginx |
| CI/CD | GitHub Actions |
