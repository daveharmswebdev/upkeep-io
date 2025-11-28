Please analyze and fix the GitHub issue(s): $ARGUMENTS.

If multiple issue numbers are provided (space-separated), treat them as related issues to be worked together in a single branch.

Follow these steps:

1. Parse the issue number(s) from the arguments
2. Use `gh issue view <number>` for EACH issue to get details; pay careful attention to comments
3. Create a single git branch for the related issues (e.g., `feature/issues-42-43`)
4. **Before lead-dev begins work:**
   - Lead-dev MUST use ref MCP to research any unfamiliar patterns or APIs
   - Lead-dev MUST follow `@shared/research-protocol.md`
   - Lead-dev MUST document sources consulted in PR description
5. Have the lead dev work the issue(s) following TDD methodology when applicable
6. **Before qa-tester reviews:**
   - QA-tester MUST use ref MCP to verify current testing patterns
   - QA-tester MUST use playwright MCP for E2E testing
   - QA-tester MUST follow `@shared/research-protocol.md`
7. Have the qa-tester check the work, running all unit tests and e2e tests
8. Also validate project build and running the project (front end and back) in dev mode. Errors during build and dev mode is intolerable.
9. If the qa-tester is satisfied, create a PR for me to check (reference ALL issues in PR description)
10. If the qa-tester is not satisfied then pass the work back to lead-dev and keep iterating until the qa-tester is satisfied

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.
