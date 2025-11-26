Please analyze and fix the GitHub issue: $ARGUMENTS.

Follow these steps:

1. Use `gh issue view` to get the issue details; pay careful attention to comments
2. Create a git branch for the issue
3. **Before lead-dev begins work:**
   - Lead-dev MUST use ref MCP to research any unfamiliar patterns or APIs
   - Lead-dev MUST follow `@shared/research-protocol.md`
   - Lead-dev MUST document sources consulted in PR description
4. Have the lead dev work the issue following TDD methodology when applicable
5. **Before qa-tester reviews:**
   - QA-tester MUST use ref MCP to verify current testing patterns
   - QA-tester MUST use playwright MCP for E2E testing
   - QA-tester MUST follow `@shared/research-protocol.md`
6. Have the qa-tester check the work, running all unit tests and e2e tests
7. Also validate project build and running the project (front end and back) in dev mode. Errors during build and dev mode is intolerable.
8. If the qa-tester is satisfied, create a PR for me to check
9. If the qa-tester is not satisfied then pass the work back to lead-dev and keep iterating until the qa-tester is satisfied

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.
