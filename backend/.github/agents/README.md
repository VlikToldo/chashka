# Agents Guide

This folder contains custom agents for this workspace.

## Available Agents

1. Adaptive Full-Stack Agent
   - File: `adaptive-full-stack.agent.md`
   - Use for: features and fixes that touch frontend and backend together.
   - Typical tasks: API-to-UI integration, cross-layer refactors, end-to-end behavior changes.

2. Adaptive Frontend UI Agent
   - File: `adaptive-frontend-ui.agent.md`
   - Use for: UI-only implementation and refactors.
   - Typical tasks: pages, layouts, components, hooks, responsive behavior, design cleanup.

3. Adaptive Backend API Agent
   - File: `adaptive-backend-api.agent.md`
   - Use for: backend API work.
   - Typical tasks: routes, controllers, services, models, middleware, validation, error handling.

4. Adaptive Auth Agent
   - File: `adaptive-auth.agent.md`
   - Use for: authentication and authorization.
   - Typical tasks: login/register, protected routes, auth middleware, token/session flows.

5. Adaptive Debug Agent
   - File: `adaptive-debug.agent.md`
   - Use for: bug investigation and fixes.
   - Typical tasks: reproduce issue, isolate root cause, apply minimal fix, verify regression risk.

6. Adaptive Review Agent
   - File: `adaptive-review.agent.md`
   - Use for: code review.
   - Typical tasks: find bugs/regressions, check architecture alignment, identify missing tests/validation.

## Quick Picker Usage

1. Open Copilot Chat.
2. Open the agent picker.
3. Select the agent that matches your task.
4. Paste a focused prompt with scope and expected result.

## Prompt Templates

- Full-stack:
  "Implement dashboard data flow from backend endpoint to frontend UI and keep separation of concerns."

- Frontend UI:
  "Refactor dashboard layout for responsive behavior and move complex UI state into a custom hook."

- Backend API:
  "Add menu filtering endpoint by category and keep controller thin with service-owned logic."

- Auth:
  "Implement protected route middleware and return consistent unauthorized responses."

- Debug:
  "Fix bug: menu page stays in loading state after API 401 response."

- Review:
  "Review menu/auth changes for regressions, thin controller violations, and missing error handling tests."

## Selection Rules

- If task crosses UI + API layers, choose Full-Stack.
- If task is visual/layout/component behavior only, choose Frontend UI.
- If task is endpoint/data flow/middleware only, choose Backend API.
- If task is access control/login/session/token behavior, choose Auth.
- If behavior is broken and root cause is unclear, choose Debug.
- If you want risk-focused feedback before merge, choose Review.

---

# Гайд По Агентах (Українська)

Ця папка містить кастомних агентів для цього workspace.

## Доступні Агенти

1. Adaptive Full-Stack Agent
   - Файл: `adaptive-full-stack.agent.md`
   - Використовуй для: задач і фіксів, які одночасно зачіпають фронтенд і бекенд.
   - Типові задачі: інтеграція API в UI, крос-шарові рефактори, наскрізні зміни поведінки.

2. Adaptive Frontend UI Agent
   - Файл: `adaptive-frontend-ui.agent.md`
   - Використовуй для: чисто UI-реалізації та UI-рефакторів.
   - Типові задачі: сторінки, лейаути, компоненти, хуки, адаптивність, покращення дизайну.

3. Adaptive Backend API Agent
   - Файл: `adaptive-backend-api.agent.md`
   - Використовуй для: бекенд API-робіт.
   - Типові задачі: routes, controllers, services, models, middleware, валідація, error handling.

4. Adaptive Auth Agent
   - Файл: `adaptive-auth.agent.md`
   - Використовуй для: authentication та authorization.
   - Типові задачі: login/register, protected routes, auth middleware, token/session флоу.

5. Adaptive Debug Agent
   - Файл: `adaptive-debug.agent.md`
   - Використовуй для: розслідування багів і виправлень.
   - Типові задачі: відтворити проблему, знайти root cause, внести мінімальний фікс, перевірити ризик регресій.

6. Adaptive Review Agent
   - Файл: `adaptive-review.agent.md`
   - Використовуй для: code review.
   - Типові задачі: знайти баги/регресії, перевірити архітектурну узгодженість, знайти пропуски в тестах/валідаціях.

## Швидке Використання Через Picker

1. Відкрий Copilot Chat.
2. Відкрий picker агентів.
3. Обери агента, який відповідає твоїй задачі.
4. Встав сфокусований промпт із чітким scope і очікуваним результатом.

## Шаблони Промптів

- Full-stack:
  "Реалізуй потік даних для dashboard від backend endpoint до frontend UI та збережи separation of concerns."

- Frontend UI:
  "Перероби layout dashboard для адаптивності й винеси складний UI state у custom hook."

- Backend API:
  "Додай endpoint фільтрації меню за category і залиш контролер тонким, а логіку в service."

- Auth:
  "Реалізуй middleware для protected routes і повертай консистентні unauthorized responses."

- Debug:
  "Виправ баг: сторінка меню лишається в loading state після API 401 response."

- Review:
  "Перевір зміни меню/auth на регресії, порушення thin controller і пропуски в error handling тестах."

## Правила Вибору Агента

- Якщо задача зачіпає і UI, і API шари, обирай Full-Stack.
- Якщо задача тільки про візуал/лейаут/поведінку компонентів, обирай Frontend UI.
- Якщо задача тільки про endpoint/data flow/middleware, обирай Backend API.
- Якщо задача про access control/login/session/token, обирай Auth.
- Якщо поведінка зламана, а root cause неочевидний, обирай Debug.
- Якщо перед merge потрібен review по ризиках, обирай Review.
