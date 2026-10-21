# 📋 School Management System — TASK BOARD

> **How This Works:**
> - The **Testing/Orchestration Chat** writes new tasks here when the user requests a feature.
> - Each specialist agent reads this board when starting their chat session.
> - Agents claim tasks by changing status from `🟡 PENDING` → `🔵 IN PROGRESS` → `✅ DONE`.

---

## ⚡ ACTIVE TASKS

> No active tasks yet. Tasks will appear here when assigned.

---

## 🟡 PENDING TASKS

> No pending tasks. Waiting for feature requests from the user.

---

## ✅ COMPLETED TASKS

> No completed tasks yet.

---

## 📌 HOW TO USE THIS BOARD

### For the User (via Testing/Orchestration Chat):
1. Tell the testing chat what feature you want
2. The agent writes it here automatically
3. Go to your FE / BE / Deploy chat
4. Tell the agent: *"Check TASK_BOARD.md and start your assigned task"*
5. The agent reads the board, claims its task, and starts coding

### For Agent Chats (FE / BE / Deploy):
At the start of every session, run:
> *"Read TASK_BOARD.md and check if there are any PENDING tasks assigned to you. If yes, claim the task and start working."*

---

## 📐 TASK FORMAT

Each task follows this structure:

```
### TASK-XXX: [Feature Name]
- **Status**: 🟡 PENDING / 🔵 IN PROGRESS / ✅ DONE
- **Assigned To**: sms_fe_agent / sms_be_agent / sms_deploy_agent / ALL
- **Priority**: 🔴 High / 🟡 Medium / 🟢 Low
- **Created By**: sms_test_agent (Orchestration Chat)
- **Feature Spec**: docs/features/TASK-XXX.md
- **Notes**: [Any additional context]
```
