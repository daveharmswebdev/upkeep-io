# Installation Guide

## Plugin Location

Your plugin is located at:
```
/Users/walterharms/workspace/upkeep-io/upkeep-io-plugin/
```

## Auto-Discovery

Claude Code automatically discovers plugins in the following locations:

1. **Local Project Plugin** (Recommended for this setup)
   - Place the plugin in your project root or subdirectory
   - Claude Code will auto-discover it via the `.claude-plugin/plugin.json` file

2. **Global Plugins**
   - Place in `~/.claude/plugins/` for global availability

## Current Setup

Your plugin is configured as a **local project plugin**. It will be automatically discovered by Claude Code because it contains:

```
upkeep-io-plugin/
├── .claude-plugin/
│   └── plugin.json
├── agents/
│   └── [agent files]
├── commands/
│   └── [command files]
└── skills/
    └── [skill directories]
```

## Using the Plugin

Once installed, you can access the plugin's components:

### Accessing Agents
The plugin provides 4 agents that Claude will offer when appropriate:
- `business-analyst` - Business analysis and requirements
- `lead-dev` - Architecture and technical guidance
- `qa-tester` - Testing and quality assurance
- `ui-design-specialist` - UI/UX design guidance

Request them directly:
```
Let me consult the lead-dev agent to review this implementation.
I'll use the business-analyst to define requirements for this feature.
```

### Using the Slash Command
```
/work-issue 123
```

### Accessing Skills
The plugin provides 3 reusable skills:
- `github-issue-writer` - GitHub issue creation
- `vue-development` - Vue 3 development patterns
- `typescript-development` - TypeScript backend development

These are invoked automatically by Claude when relevant.

## Configuration

The plugin doesn't require any additional configuration in `settings.local.json`. It's auto-discovered!

## What's Included

| Type | Count | Components |
|------|-------|------------|
| Commands | 1 | work-issue |
| Agents | 4 | business-analyst, lead-dev, qa-tester, ui-design-specialist |
| Skills | 3 | github-issue-writer, vue-development, typescript-development |

## Next Steps

1. **Optional:** Move the plugin to a different location if preferred
2. **Optional:** Share the plugin with team members via git
3. **Start using** the agents and skills in your development workflow
4. **Reference** the README.md for detailed usage examples

## Troubleshooting

If the plugin isn't being discovered:

1. Check that `.claude-plugin/plugin.json` exists
2. Verify the JSON is valid: `cat .claude-plugin/plugin.json | jq`
3. Restart Claude Code
4. Check the plugin path is relative to where Claude Code runs

## Next: Consider Removing Original Files

You now have both the original `.claude/` directory AND the new plugin. To avoid duplication, you could:

**Option A: Keep Both (Safe)**
- Keep the original `.claude/` files
- Use the plugin as a backup or for distribution

**Option B: Migrate to Plugin Only (Recommended)**
- Remove agent/skill/command definitions from `.claude/`
- Use only the plugin for your development workflow

To migrate to plugin only:
```bash
# Remove agents and skills from .claude/
rm -rf .claude/agents .claude/skills .claude/commands/work-issue.md

# Keep: .claude/settings.local.json (your permissions config)
```

The choice is yours! The plugin can coexist with local Claude Code files.
