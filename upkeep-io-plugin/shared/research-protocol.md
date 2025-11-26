# Research Protocol

**All agents and skills in this plugin MUST follow this protocol before making recommendations.**

## When Research is REQUIRED (Blocking)

You MUST research via MCP tools when ANY of these conditions apply:

| Condition | Why | MCP Tool |
|-----------|-----|----------|
| Technology decision you haven't verified this session | Docs may have changed | `mcp__Ref__ref_search_documentation` |
| Compliance/legal/tax question | Regulations change annually | `mcp__firecrawl__firecrawl_search` |
| Unfamiliar library or API | Training data may be outdated | `mcp__Ref__ref_read_url` |
| Version-specific feature (Vue 3.4+, Prisma 5+, etc.) | Version-specific behavior | Ref |
| Security-related decision | OWASP guidelines evolve | Firecrawl |
| Accessibility requirement | WCAG guidelines are detailed | Ref |

## When Research Can Be Skipped

You MAY skip research if ALL of these are true:
- You already researched this exact topic in the current conversation
- The information is stable (e.g., basic TypeScript syntax, established Clean Architecture patterns)
- You can cite the source from your earlier research

**When in doubt, research. The cost of an MCP call is far less than the cost of bad advice.**

## Assessment Before Research

Before making an MCP call, ask yourself:
1. "Have I already verified this in this session?" → If yes, cite previous research
2. "Is this information likely to have changed recently?" → If stable, may skip
3. "Am I making a recommendation based on this?" → If yes, verify
4. "Could my training data be outdated for this?" → If yes, research

## Research Output Format

After research, document in your response:

```
### Research Conducted
- **Query**: [What you searched for]
- **Source**: [URL or documentation reference]
- **Key Finding**: [1-2 sentence summary]
- **Applied To**: [How this influenced your recommendation]
```

## MCP Tool Selection Guide

| Need | Tool | Example Query |
|------|------|---------------|
| Framework/library docs | `mcp__Ref__ref_search_documentation` | "Vue 3.4 defineModel TypeScript" |
| Read specific URL | `mcp__Ref__ref_read_url` | Pass exact URL from search results |
| Current regulations/compliance | `mcp__firecrawl__firecrawl_search` | "IRS Schedule E rental property deductions 2024" |
| GitHub examples/community | `mcp__firecrawl__firecrawl_search` | "inversify Express repository pattern site:github.com" |
| Scrape specific page | `mcp__firecrawl__firecrawl_scrape` | When you need full page content |

## Domain-Specific Research Requirements

### For Technical Decisions (lead-dev, typescript-development, vue-development)
- Always verify current library versions and breaking changes
- Check official migration guides when recommending patterns
- Verify Prisma, Vue, Express patterns against current docs

### For Compliance/Business (business-analyst)
- **NEVER** rely on training data for:
  - IRS tax rules (Schedule E, deductions, depreciation)
  - Fair Housing law requirements
  - State-specific landlord-tenant regulations
- Always cite official government sources or recent publications

### For Testing (qa-tester)
- Verify current testing library APIs before writing tests
- Check OWASP guidance before security reviews
- Verify WCAG standards before accessibility audits

### For Design (ui-design-specialist)
- Check current Tailwind documentation for utility classes
- Verify WCAG color contrast requirements
- Research current accessibility patterns for components

## Enforcement

**Responses that make recommendations without documented research (where required) are considered incomplete.**

When reviewing your own output, verify:
- [ ] Did I identify what external knowledge this task requires?
- [ ] Did I assess whether I've already verified this information?
- [ ] Did I use MCP tools where required?
- [ ] Did I document my sources in the response?
