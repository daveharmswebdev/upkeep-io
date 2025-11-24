# Upkeep IO Development Toolkit Plugin

A comprehensive Claude Code plugin that provides a complete multi-agent development workflow for building and maintaining the **upkeep-io property management system**.

This plugin bundles 1 slash command, 4 specialized agents, and 3 reusable skills—all tailored to the upkeep-io project's Clean Architecture, monorepo structure, and domain model.

## 📦 What's Included

### Slash Commands
- **`/work-issue`** - Complete GitHub issue resolution workflow
  - Fetches issue details via GitHub CLI
  - Orchestrates collaboration between lead-dev and qa-tester agents
  - Follows TDD methodology
  - Validates unit tests, E2E tests, and builds
  - Creates PR when all quality checks pass

### Agents

#### Business Analyst (`business-analyst`)
**Expertise:** Requirements analysis, business process design, domain knowledge

Specializes in:
- Writing user stories and acceptance criteria
- IRS Schedule E tax compliance guidance
- Fair Housing law compliance
- Vendor management workflows
- Lease lifecycle management
- Ensuring all business rules are documented

#### Lead Developer (`lead-dev`)
**Expertise:** Architecture, code quality, system design, technical mentoring

Specializes in:
- Clean Architecture enforcement (layer separation, dependency direction)
- Feature implementation guidance (layer-by-layer design)
- Code review standards and quality metrics
- Deployment and operations (Railway, Flyway migrations)
- Mentoring and architectural decision-making
- Repository pattern implementation

#### QA Tester (`qa-tester`)
**Expertise:** Integration testing, end-to-end testing, quality assurance

Specializes in:
- Writing integration tests with real database
- Building Playwright E2E test suites
- Security testing (OWASP Top 10)
- Accessibility compliance (WCAG standards)
- Test pyramid strategy (unit, integration, E2E)
- Test data management and infrastructure

#### UI Design Specialist (`ui-design-specialist`)
**Expertise:** Visual design, interaction design, design systems, accessibility

Specializes in:
- Component design specifications
- Design system consistency
- Accessibility compliance
- Mobile-first responsive design
- Tailwind CSS integration
- Handoff documentation for developers

### Skills

#### GitHub Issue Writer
Creates well-structured GitHub issues with:
- User story format (As a... I want... So that...)
- Context sections
- Success criteria (Given/When/Then)
- Technical requirements
- Definition of Done checklist

**Use case:** Creating issues for feature requests, bug reports, and refactoring tasks

#### Vue Development
Enforces TypeScript-first patterns for Vue 3 with:
- Composition API best practices
- `defineModel` for two-way binding
- Testing Library user-behavior patterns
- MSW API mocking
- Common pitfall avoidance

**Use case:** Planning and implementing Vue 3 components following modern patterns

#### TypeScript Development
Guides building TypeScript Express APIs with:
- Clean Architecture patterns
- Inversify dependency injection setup
- Prisma ORM integration
- 8-step feature creation workflow
- JWT + bcrypt authentication
- Railway deployment configuration

**Use case:** Implementing backend features following established architectural patterns

## 🚀 Installation

### Option 1: Local Development
1. Clone this plugin to your workspace:
   ```bash
   git clone <repo-url> upkeep-io-plugin
   ```

2. Update your Claude Code settings to reference the plugin:
   ```json
   {
     "plugins": ["./upkeep-io-plugin"]
   }
   ```

### Option 2: From Repository
If this plugin is checked into your project:
```json
{
  "plugins": [
    "./upkeep-io-plugin"
  ]
}
```

## 💡 Usage Examples

### Start Working on a GitHub Issue
```
/work-issue 123
```
This orchestrates the complete workflow:
1. Lead dev analyzes and implements
2. QA tester validates with tests
3. PR created when all checks pass
4. Lead dev and QA iterate until satisfied

### Design a New Feature
```
I need to add recurring service scheduling for HVAC maintenance.
Can the business-analyst help define the requirements?
```

### Review Code for Architectural Compliance
```
I've finished the vendor payment tracking feature.
Let me use the lead-dev agent to review it for architectural compliance.
```

### Write Integration Tests
```
I've added the lease CRUD endpoints. Can the qa-tester write integration tests?
```

### Design a UI Component
```
I need to design a property card component for the list view.
Can the ui-design-specialist help with specifications?
```

## 🔗 MCP Integration

This plugin's agents are **fully integrated with Model Context Protocols (MCPs)** for enhanced research, testing, and verification capabilities:

### Agent MCP Usage

**lead-dev Agent**
- **Ref MCP** (`mcp__Ref__*`) - ALWAYS uses for researching framework documentation, TypeScript patterns, Railway deployment docs
- **When you ask:** "Should we use Express middleware X?" → Agent automatically researches official docs via ref MCP

**qa-tester Agent**
- **Playwright MCP** (`mcp__playwright__browser_*`) - PREFERRED for E2E testing instead of local setup
  - Instant browser automation without installation
  - Integrated testing with real-time feedback
- **Ref MCP** - For researching testing frameworks and best practices
- **When you ask:** "Write E2E tests for login flow" → Agent uses Playwright MCP tools directly

**business-analyst Agent**
- **Ref MCP** - CRITICAL for researching IRS tax rules, Fair Housing compliance, state regulations
- **Firecrawl MCP** - For web research on latest regulations and case law
- **When you ask:** "How should we handle security deposits?" → Agent researches current state laws via MCPs before advising

**ui-design-specialist Agent**
- **Ref MCP** - ALWAYS uses for WCAG accessibility guidelines, Tailwind documentation, Vue 3 patterns
- **Firecrawl MCP** - For researching design trends and best practices
- **When you ask:** "Design an accessible form" → Agent researches WCAG standards via ref MCP

### Key Benefits

✅ **Always Current** - MCPs provide real-time documentation lookups instead of relying on training data
✅ **Compliance-Focused** - Business-analyst proactively researches tax/legal requirements before advising
✅ **Efficient Testing** - QA-tester uses Playwright MCP for instant E2E testing without setup
✅ **Research-Backed** - All architectural, design, and compliance decisions backed by official docs
✅ **No Outdated Advice** - Agents verify current standards and best practices for every recommendation

## 🏗️ Architecture Context

This plugin assumes familiarity with:

### Clean Architecture Layers
```
apps/backend/src/
├── core/                    # Pure domain models
├── domain/                  # Abstract boundaries (interfaces)
├── application/             # Use cases (business logic)
├── infrastructure/          # Concrete implementations (Prisma, bcrypt, etc.)
└── presentation/            # HTTP controllers and routes
```

### Shared Libraries (DRY Principle)
```
libs/
├── domain/                  # Shared entities (Property, MaintenanceWork, etc.)
├── validators/              # Zod schemas (used by frontend & backend)
└── auth/                    # JWT utilities
```

### Monorepo Structure
- `apps/backend/` - Node/Express API
- `apps/frontend/` - Vue 3 SPA
- `libs/` - Shared TypeScript libraries

## 🎯 Agent Specializations

### When to Use Each Agent

| Agent | Best For |
|-------|----------|
| **business-analyst** | Feature requirements, business process design, compliance guidance |
| **lead-dev** | Implementation guidance, code reviews, architectural decisions |
| **qa-tester** | Test writing, quality assurance, security/accessibility reviews |
| **ui-design-specialist** | Component design, design system consistency, accessibility |

## 🔧 Key Features

### 1. Integrated Workflow
The `work-issue` command orchestrates all agents:
- Fetches GitHub issue details
- Dispatches to lead-dev for implementation
- Routes to qa-tester for validation
- Iterates until quality standards met

### 2. Domain Expertise
All agents understand:
- Property management workflows
- IRS Schedule E tax compliance
- Fair Housing law requirements
- Rental property industry best practices

### 3. Architectural Enforcement
Built-in enforcement of:
- Clean Architecture principles
- Monorepo shared library patterns
- Dependency injection (inversify)
- DRY principle (shared validators, utilities)

### 4. Quality Standards
Includes guidance on:
- Test pyramid strategy
- Code review checklist
- Accessibility compliance (WCAG)
- Security testing (OWASP Top 10)

## 📚 Documentation

### Project Documentation
The agents reference these key documents:
- `CLAUDE.md` - Project overview, architecture, patterns
- `property-management-domain-model.md` - Entity relationships
- `docs/render-deployment.md` - Deployment guide
- `docs/typescript-configuration.md` - TypeScript setup

### Plugin Files
- `.claude-plugin/plugin.json` - Plugin metadata
- `commands/` - Slash commands
- `agents/` - Agent definitions
- `skills/` - Reusable skills

## 🎓 Learning Resources

### Clean Architecture
Each agent has context about:
- Domain-driven design principles
- Proper dependency direction
- Layer separation and boundaries
- Repository pattern implementation

### Property Management Domain
Agents understand:
- Property lifecycle (acquisition → maintenance → sale)
- Maintenance work tracking (labor, materials, travel)
- Vendor management (onboarding, insurance, 1099s)
- Lease lifecycle (application → renewal → move-out)
- Tax deduction tracking (IRS compliance)

### Technical Stack
Full context on:
- Express + Node.js backend patterns
- Vue 3 Composition API patterns
- Prisma ORM and PostgreSQL
- Tailwind CSS design system
- Playwright for E2E testing
- Railway deployment

## 🔐 Best Practices

### Using the Agents Effectively

1. **Start with business-analyst** for feature planning
   - Get clear requirements before coding
   - Understand tax/legal implications early

2. **Consult lead-dev** before implementation
   - Verify architectural approach
   - Check existing patterns in codebase

3. **Have qa-tester review** before PR
   - Ensure test coverage
   - Validate security/accessibility

4. **Use ui-design-specialist** for new UI
   - Maintain design system consistency
   - Ensure accessibility compliance

### Code Quality Checklist

Before merging:
- ✅ Business requirements documented (user stories, acceptance criteria)
- ✅ Architectural review passed (Clean Architecture compliance)
- ✅ Unit tests written (80%+ coverage for use cases)
- ✅ Integration tests added (full request flow)
- ✅ E2E tests for user workflows (critical paths)
- ✅ Security review completed (OWASP Top 10)
- ✅ Accessibility verified (WCAG AA compliance)
- ✅ Code follows DRY principle (no duplication)

## 🐛 Troubleshooting

### Skills Not Appearing
1. Ensure plugin is in correct directory
2. Check `.claude-plugin/plugin.json` is valid JSON
3. Verify skill directories have `SKILL.md` files

### Agents Not Available
1. Confirm `agents/` directory exists
2. Check agent `.md` files have YAML frontmatter with `name:` field
3. Verify agent names match those in `plugin.json`

### Commands Not Working
1. Ensure `commands/` directory exists
2. Check command files are `.md` format
3. Verify command references are correct in plugin.json

## 📝 License

MIT

## 🤝 Contributing

This plugin is tailored to the upkeep-io project. To improve it:
1. Update agent definitions in `.claude/agents/` (development)
2. Modify skills in `.claude/skills/` (development)
3. Test changes with `/clear` and reload
4. Update `plugin.json` with any new features
5. Commit changes to your fork

## 📞 Support

For questions about:
- **Architecture & Design:** Consult `lead-dev` agent
- **Requirements & Business Rules:** Consult `business-analyst` agent
- **Testing & Quality:** Consult `qa-tester` agent
- **UI/UX Design:** Consult `ui-design-specialist` agent

## 🎉 Quick Start

1. **Understand your task** using the business-analyst
2. **Plan implementation** with the lead-dev
3. **Write tests** guided by qa-tester
4. **Execute work-issue workflow** for complete integration
5. **Review design** with ui-design-specialist if UI work

Start building better property management software with expert guidance at every step!
