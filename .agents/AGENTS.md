# Flow Bright SRP Agent Rules

## Browser Testing Credentials
Whenever executing browser-based testing or opening subagents:
* Standard user testing credentials must be retrieved directly from the `.env` file located in the workspace root.

## Git Workflow & Autonomous Loop Execution

### 1. Git Workflow Concepts
* **Branch Awareness**: Verify current branch state (`git status`, `git branch`) before making changes. Work on appropriate feature or fix branches.
* **Atomic Conventional Commits**: Commit changes atomically upon completing logical units of work. Use Conventional Commits standard format:
  - `feat(...)`: New features or enhancements
  - `fix(...)`: Bug fixes
  - `test(...)`: Adding or updating tests
  - `refactor(...)`: Code refactoring without behavioral changes
  - `docs(...)` or `style(...)`: Documentation or styling adjustments
* **Clean Working Tree**: Ensure untracked or unwanted scratch files are cleaned up or gitignored.

### 2. Autonomous Loop Execution
* **Automated Development Loop**: Continuously execute the complete development cycle for each iteration:
  1. **Plan & Implement**: Make required code changes adhering to architectural rules.
  2. **Auto-Verify**: Automatically run tests (`npm run test` / `vitest`) and typechecks (`npx nuxi typecheck`) to validate changes.
  3. **Auto-Commit**: Automatically stage and commit verified changes using git once verification succeeds.
* **Uninterrupted Flow**: Perform all iteration loops autonomously without stopping for manual prompts between subtasks unless blocked by critical ambiguity or requiring explicit credentials/user decisions.

