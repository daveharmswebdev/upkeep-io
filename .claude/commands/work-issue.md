Please analyze and fix the GitHub issue: $ARGUMENTS.

Follow these steps:

1. Use `gh issue view` to get the issue details including comments
2. Create a git branch for the issue
3. Pass the issue to the lead-dev agent
4. Have the lead dev work the issue
5. Let's follow a TDD methodology when applicable
6. Have the qa-tester check the work, running all unit tests and e2e tests
7. Also validate project build and running the project in dev mode
8. If the qa-tester is satisifed, create a pr for me check
9.  If the qa-tester is not satisfied then pass the work back to lead-dev and keep iterating until the qa-tester is satisfied

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.
Remind the qa-tester that he has the playwright mcp at his disposal.
Remind both lead-dev and qa-tester that technical documentation can be research with the ref MCP.