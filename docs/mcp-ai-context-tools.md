# MCP ai-context tools

Declarações exatamente como estão nos arquivos de tool do MCP `user-ai-context`.

## agent
```json
{
  "name": "agent",
  "description": "Agent orchestration and discovery. Actions:\n- discover: Discover all agents (built-in + custom)\n- getInfo: Get agent details (params: agentType)\n- orchestrate: Select agents for task/phase/role (params: task?, phase?, role?)\n- getSequence: Get agent handoff sequence (params: task, includeReview?, phases?)\n- getDocs: Get agent documentation (params: agent)\n- getPhaseDocs: Get phase documentation (params: phase)\n- listTypes: List all agent types",
  "arguments": {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": [
          "discover",
          "getInfo",
          "orchestrate",
          "getSequence",
          "getDocs",
          "getPhaseDocs",
          "listTypes"
        ],
        "description": "Action to perform"
      },
      "agentType": {
        "description": "(getInfo) Agent type identifier",
        "type": "string"
      },
      "task": {
        "description": "(orchestrate, getSequence) Task description",
        "type": "string"
      },
      "phase": {
        "description": "(orchestrate, getPhaseDocs) PREVC phase",
        "type": "string",
        "enum": [
          "P",
          "R",
          "E",
          "V",
          "C"
        ]
      },
      "role": {
        "description": "(orchestrate) PREVC role",
        "type": "string",
        "enum": [
          "planner",
          "designer",
          "architect",
          "developer",
          "qa",
          "reviewer",
          "documenter",
          "solo-dev"
        ]
      },
      "includeReview": {
        "description": "(getSequence) Include code review",
        "type": "boolean"
      },
      "phases": {
        "description": "(getSequence) Phases to include",
        "type": "array",
        "items": {
          "type": "string",
          "enum": [
            "P",
            "R",
            "E",
            "V",
            "C"
          ]
        }
      },
      "agent": {
        "description": "(getDocs) Agent type for docs",
        "type": "string",
        "enum": [
          "code-reviewer",
          "bug-fixer",
          "feature-developer",
          "refactoring-specialist",
          "test-writer",
          "documentation-writer",
          "performance-optimizer",
          "security-auditor",
          "backend-specialist",
          "frontend-specialist",
          "architect-specialist",
          "devops-specialist",
          "database-specialist",
          "mobile-specialist"
        ]
      }
    },
    "required": [
      "action"
    ],
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
}
```

## context
```json
{
  "name": "context",
  "description": "Context scaffolding and semantic context. Actions:\n- check: Check if .context scaffolding exists (params: repoPath?)\n- init: Initialize .context scaffolding (params: repoPath?, type?, outputDir?, semantic?, autoFill?, skipContentGeneration?)\n- fill: Fill scaffolding with AI content (params: repoPath?, outputDir?, target?, offset?, limit?)\n- fillSingle: Fill a single scaffold file (params: repoPath?, filePath)\n- listToFill: List files that need filling (params: repoPath?, outputDir?, target?)\n- getMap: Get codebase map section (params: repoPath?, section?)\n- buildSemantic: Build semantic context (params: repoPath?, contextType?, targetFile?, options?)\n- scaffoldPlan: Create a plan template (params: planName, repoPath?, title?, summary?, autoFill?)\n\n**Important:** Agents should provide repoPath on the FIRST call, then it will be cached:\n1. First call: context({ action: \"check\", repoPath: \"/path/to/project\" })\n2. Subsequent calls can omit repoPath - it will use cached value from step 1\n3. After context init, call fillSingle for each pending file\n4. Call workflow-init to enable PREVC workflow (unless trivial change)",
  "arguments": {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": [
          "check",
          "init",
          "fill",
          "fillSingle",
          "listToFill",
          "getMap",
          "buildSemantic",
          "scaffoldPlan"
        ],
        "description": "Action to perform"
      },
      "repoPath": {
        "description": "Repository path (defaults to cwd)",
        "type": "string"
      },
      "outputDir": {
        "description": "Output directory (default: ./.context)",
        "type": "string"
      },
      "type": {
        "description": "(init) Type of scaffolding to create",
        "type": "string",
        "enum": [
          "docs",
          "agents",
          "both"
        ]
      },
      "semantic": {
        "description": "(init, scaffoldPlan) Enable semantic analysis",
        "type": "boolean"
      },
      "include": {
        "description": "(init) Include patterns",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "exclude": {
        "description": "(init) Exclude patterns",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "autoFill": {
        "description": "(init, scaffoldPlan) Auto-fill with codebase content",
        "type": "boolean"
      },
      "skipContentGeneration": {
        "description": "(init) Skip pre-generating content",
        "type": "boolean"
      },
      "target": {
        "description": "(fill, listToFill) Which scaffolding to target",
        "type": "string",
        "enum": [
          "docs",
          "agents",
          "plans",
          "all"
        ]
      },
      "offset": {
        "description": "(fill) Skip first N files",
        "type": "number"
      },
      "limit": {
        "description": "(fill) Max files to return",
        "type": "number"
      },
      "filePath": {
        "description": "(fillSingle) Absolute path to scaffold file",
        "type": "string"
      },
      "section": {
        "description": "(getMap) Section to retrieve",
        "type": "string",
        "enum": [
          "all",
          "stack",
          "structure",
          "architecture",
          "symbols",
          "symbols.classes",
          "symbols.interfaces",
          "symbols.functions",
          "symbols.types",
          "symbols.enums",
          "publicAPI",
          "dependencies",
          "stats"
        ]
      },
      "contextType": {
        "description": "(buildSemantic) Type of context to build",
        "type": "string",
        "enum": [
          "documentation",
          "playbook",
          "plan",
          "compact"
        ]
      },
      "targetFile": {
        "description": "(buildSemantic) Target file for focused context",
        "type": "string"
      },
      "options": {
        "description": "(buildSemantic) Builder options",
        "type": "object",
        "properties": {
          "useLSP": {
            "type": "boolean"
          },
          "maxContextLength": {
            "type": "number"
          },
          "includeDocumentation": {
            "type": "boolean"
          },
          "includeSignatures": {
            "type": "boolean"
          }
        }
      },
      "planName": {
        "description": "(scaffoldPlan) Name of the plan",
        "type": "string"
      },
      "title": {
        "description": "(scaffoldPlan) Plan title",
        "type": "string"
      },
      "summary": {
        "description": "(scaffoldPlan) Plan summary/goal",
        "type": "string"
      }
    },
    "required": [
      "action"
    ],
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
}
```

## explore
```json
{
  "name": "explore",
  "description": "File and code exploration. Actions:\n- read: Read file contents (params: filePath, encoding?)\n- list: List files matching pattern (params: pattern, cwd?, ignore?)\n- analyze: Analyze symbols in a file (params: filePath, symbolTypes?)\n- search: Search code with regex (params: pattern, fileGlob?, maxResults?, cwd?)\n- getStructure: Get directory structure (params: rootPath?, maxDepth?, includePatterns?)",
  "arguments": {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": [
          "read",
          "list",
          "analyze",
          "search",
          "getStructure"
        ],
        "description": "Action to perform"
      },
      "filePath": {
        "description": "(read, analyze) File path to read or analyze",
        "type": "string"
      },
      "pattern": {
        "description": "(list, search) Glob pattern for list, regex pattern for search",
        "type": "string"
      },
      "cwd": {
        "description": "(list, search) Working directory",
        "type": "string"
      },
      "encoding": {
        "description": "(read) File encoding",
        "type": "string",
        "enum": [
          "utf-8",
          "ascii",
          "binary"
        ]
      },
      "ignore": {
        "description": "(list) Patterns to ignore",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "symbolTypes": {
        "description": "(analyze) Types of symbols to extract",
        "type": "array",
        "items": {
          "type": "string",
          "enum": [
            "class",
            "interface",
            "function",
            "type",
            "enum"
          ]
        }
      },
      "fileGlob": {
        "description": "(search) Glob pattern to filter files",
        "type": "string"
      },
      "maxResults": {
        "description": "(search) Maximum results to return",
        "type": "number"
      },
      "rootPath": {
        "description": "(getStructure) Root path for structure",
        "type": "string"
      },
      "maxDepth": {
        "description": "(getStructure) Maximum directory depth",
        "type": "number"
      },
      "includePatterns": {
        "description": "(getStructure) Include patterns",
        "type": "array",
        "items": {
          "type": "string"
        }
      }
    },
    "required": [
      "action"
    ],
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
}
```

## plan
```json
{
  "name": "plan",
  "description": "Plan management and execution tracking. Actions:\n- link: Link plan to workflow (params: planSlug)\n- getLinked: Get all linked plans\n- getDetails: Get detailed plan info (params: planSlug)\n- getForPhase: Get plans for PREVC phase (params: phase)\n- updatePhase: Update plan phase status (params: planSlug, phaseId, status)\n- recordDecision: Record a decision (params: planSlug, title, description, phase?, alternatives?)\n- updateStep: Update step status (params: planSlug, phaseId, stepIndex, status, output?, notes?)\n- getStatus: Get plan execution status (params: planSlug)\n- syncMarkdown: Sync tracking to markdown (params: planSlug)\n- commitPhase: Create git commit for completed phase (params: planSlug, phaseId, coAuthor?, stagePatterns?, dryRun?)",
  "arguments": {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": [
          "link",
          "getLinked",
          "getDetails",
          "getForPhase",
          "updatePhase",
          "recordDecision",
          "updateStep",
          "getStatus",
          "syncMarkdown",
          "commitPhase"
        ],
        "description": "Action to perform"
      },
      "planSlug": {
        "description": "Plan slug/identifier",
        "type": "string"
      },
      "phaseId": {
        "description": "(updatePhase, updateStep, commitPhase) Phase ID",
        "type": "string"
      },
      "status": {
        "description": "(updatePhase, updateStep) New status",
        "type": "string",
        "enum": [
          "pending",
          "in_progress",
          "completed",
          "skipped"
        ]
      },
      "phase": {
        "description": "(getForPhase, recordDecision) PREVC phase",
        "type": "string",
        "enum": [
          "P",
          "R",
          "E",
          "V",
          "C"
        ]
      },
      "title": {
        "description": "(recordDecision) Decision title",
        "type": "string"
      },
      "description": {
        "description": "(recordDecision) Decision description",
        "type": "string"
      },
      "alternatives": {
        "description": "(recordDecision) Considered alternatives",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "stepIndex": {
        "description": "(updateStep) Step number (1-based)",
        "type": "number"
      },
      "output": {
        "description": "(updateStep) Step output artifact",
        "type": "string"
      },
      "notes": {
        "description": "(updateStep) Execution notes",
        "type": "string"
      },
      "coAuthor": {
        "description": "(commitPhase) Agent name for Co-Authored-By footer",
        "type": "string"
      },
      "stagePatterns": {
        "description": "(commitPhase) Patterns for files to stage (default: [\".context/**\"])",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "dryRun": {
        "description": "(commitPhase) Preview without committing",
        "type": "boolean"
      }
    },
    "required": [
      "action"
    ],
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
}
```

## skill
```json
{
  "name": "skill",
  "description": "Skill management for on-demand expertise. Actions:\n- list: List all skills (params: includeContent?)\n- getContent: Get skill content (params: skillSlug)\n- getForPhase: Get skills for PREVC phase (params: phase)\n- scaffold: Generate skill files (params: skills?, force?)\n- export: Export skills to AI tools (params: preset?, includeBuiltIn?, force?)\n- fill: Fill skills with codebase content (params: skills?, force?)",
  "arguments": {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": [
          "list",
          "getContent",
          "getForPhase",
          "scaffold",
          "export",
          "fill"
        ],
        "description": "Action to perform"
      },
      "skillSlug": {
        "description": "(getContent) Skill identifier",
        "type": "string"
      },
      "phase": {
        "description": "(getForPhase) PREVC phase",
        "type": "string",
        "enum": [
          "P",
          "R",
          "E",
          "V",
          "C"
        ]
      },
      "skills": {
        "description": "(scaffold, fill) Specific skills to process",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "includeContent": {
        "description": "(list) Include full content",
        "type": "boolean"
      },
      "includeBuiltIn": {
        "description": "(export, fill) Include built-in skills",
        "type": "boolean"
      },
      "preset": {
        "description": "(export) Target AI tool",
        "type": "string",
        "enum": [
          "claude",
          "gemini",
          "codex",
          "antigravity",
          "all"
        ]
      },
      "force": {
        "description": "(scaffold, export) Overwrite existing",
        "type": "boolean"
      }
    },
    "required": [
      "action"
    ],
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
}
```

## sync
```json
{
  "name": "sync",
  "description": "Import/export synchronization with AI tools. Actions:\n- exportRules: Export rules to AI tools (params: preset?, force?, dryRun?)\n- exportDocs: Export docs to AI tools (params: preset?, indexMode?, force?, dryRun?)\n- exportAgents: Export agents to AI tools (params: preset?, mode?, force?, dryRun?)\n- exportContext: Export all context (params: preset?, skipDocs?, skipAgents?, skipSkills?, docsIndexMode?, agentMode?, force?, dryRun?)\n- exportSkills: Export skills to AI tools (params: preset?, includeBuiltIn?, force?)\n- reverseSync: Import from AI tools to .context/ (params: skipRules?, skipAgents?, skipSkills?, mergeStrategy?, dryRun?, force?, addMetadata?)\n- importDocs: Import docs from AI tools (params: autoDetect?, force?, dryRun?)\n- importAgents: Import agents from AI tools (params: autoDetect?, force?, dryRun?)\n- importSkills: Import skills from AI tools (params: autoDetect?, mergeStrategy?, force?, dryRun?)",
  "arguments": {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": [
          "exportRules",
          "exportDocs",
          "exportAgents",
          "exportContext",
          "exportSkills",
          "reverseSync",
          "importDocs",
          "importAgents",
          "importSkills"
        ],
        "description": "Action to perform"
      },
      "preset": {
        "description": "Target AI tool preset",
        "type": "string"
      },
      "force": {
        "description": "Overwrite existing files",
        "type": "boolean"
      },
      "dryRun": {
        "description": "Preview without writing",
        "type": "boolean"
      },
      "indexMode": {
        "description": "(exportDocs) Index mode",
        "type": "string",
        "enum": [
          "readme",
          "all"
        ]
      },
      "mode": {
        "description": "(exportAgents) Sync mode",
        "type": "string",
        "enum": [
          "symlink",
          "markdown"
        ]
      },
      "skipDocs": {
        "description": "(exportContext) Skip docs",
        "type": "boolean"
      },
      "skipAgents": {
        "description": "(exportContext, reverseSync) Skip agents",
        "type": "boolean"
      },
      "skipSkills": {
        "description": "(exportContext, reverseSync) Skip skills",
        "type": "boolean"
      },
      "skipRules": {
        "description": "(reverseSync) Skip rules",
        "type": "boolean"
      },
      "docsIndexMode": {
        "description": "(exportContext) Docs index mode",
        "type": "string",
        "enum": [
          "readme",
          "all"
        ]
      },
      "agentMode": {
        "description": "(exportContext) Agent sync mode",
        "type": "string",
        "enum": [
          "symlink",
          "markdown"
        ]
      },
      "includeBuiltInSkills": {
        "description": "(exportContext) Include built-in skills",
        "type": "boolean"
      },
      "includeBuiltIn": {
        "description": "(exportSkills) Include built-in skills",
        "type": "boolean"
      },
      "mergeStrategy": {
        "description": "(reverseSync, importSkills) Conflict handling",
        "type": "string",
        "enum": [
          "skip",
          "overwrite",
          "merge",
          "rename"
        ]
      },
      "autoDetect": {
        "description": "(import*) Auto-detect files",
        "type": "boolean"
      },
      "addMetadata": {
        "description": "(reverseSync) Add frontmatter metadata",
        "type": "boolean"
      },
      "repoPath": {
        "description": "Repository path",
        "type": "string"
      }
    },
    "required": [
      "action"
    ],
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
}
```

## workflow-advance
```json
{
  "name": "workflow-advance",
  "description": "Advance workflow to the next PREVC phase (P→R→E→V→C).\n\nEnforces gates:\n- P→R: Requires plan if require_plan=true\n- R→E: Requires approval if require_approval=true\n\nUse force=true to bypass gates, or use workflow-manage({ action: 'setAutonomous' }).",
  "arguments": {
    "type": "object",
    "properties": {
      "outputs": {
        "description": "Artifact paths produced in current phase",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "force": {
        "description": "Force advancement even if gates block",
        "type": "boolean"
      }
    },
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
}
```

## workflow-init
```json
{
  "name": "workflow-init",
  "description": "Initialize a PREVC workflow for structured development.\n\n**What it does:**\n- Creates .context/workflow/ folder (automatically, if it doesn't exist)\n- Initializes workflow status file with phase tracking\n- Detects project scale and configures gates\n- Sets up PREVC phases (Plan → Review → Execute → Verify → Complete)\n\n**Prerequisites:**\n- .context/ folder must exist (use context with action \"init\" first)\n- Scaffolding files should be filled (use context with action \"fillSingle\")\n\n**When to use:**\n- Starting a new feature or bug fix after scaffolding is set up\n- Need structured, phase-gated development\n- Working on non-trivial changes\n\n**Don't use if:**\n- Making trivial changes (typo fixes, single-line edits)\n- Just exploring/researching code\n- User explicitly wants to skip workflow",
  "arguments": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Workflow/feature name (required)"
      },
      "description": {
        "description": "Task description for scale detection",
        "type": "string"
      },
      "scale": {
        "description": "Project scale - AI should evaluate based on task characteristics:\n\nSCALE EVALUATION CRITERIA:\n• QUICK: Single file changes, bug fixes, typos (~5 min)\n  - Phases: E → V only\n  - Example: \"Fix typo in button text\"\n\n• SMALL: Simple features, no architecture changes (~15 min)\n  - Phases: P → E → V\n  - Example: \"Add email validation to form\"\n\n• MEDIUM: Regular features with design decisions (~30 min)\n  - Phases: P → R → E → V\n  - Example: \"Implement user profile page\"\n\n• LARGE: Complex features, systems, compliance (~1+ hour)\n  - Phases: P → R → E → V → C (full workflow)\n  - Examples: \"Build OAuth system\", \"Add GDPR compliance\"\n\nGUIDANCE:\n- Analyze task complexity, architectural impact, and review needs\n- Use LARGE for security/compliance requirements\n- When uncertain, prefer MEDIUM\n- Omit scale only if unable to evaluate (auto-detect fallback)",
        "type": "string",
        "enum": [
          "QUICK",
          "SMALL",
          "MEDIUM",
          "LARGE"
        ]
      },
      "autonomous": {
        "description": "Skip all workflow gates (default: scale-dependent)",
        "type": "boolean"
      },
      "require_plan": {
        "description": "Require plan before P→R",
        "type": "boolean"
      },
      "require_approval": {
        "description": "Require approval before R→E",
        "type": "boolean"
      },
      "archive_previous": {
        "description": "Archive existing workflow",
        "type": "boolean"
      }
    },
    "required": [
      "name"
    ],
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
}
```

## workflow-manage
```json
{
  "name": "workflow-manage",
  "description": "Manage workflow operations: handoffs, collaboration, documents, gates, approvals.\n\nActions:\n- handoff: Transfer work between agents (params: from, to, artifacts)\n- collaborate: Start collaboration session (params: topic, participants?)\n- createDoc: Create workflow document (params: type, docName)\n- getGates: Check gate status\n- approvePlan: Approve linked plan (params: planSlug?, approver?, notes?)\n- setAutonomous: Toggle autonomous mode (params: enabled, reason?)",
  "arguments": {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": [
          "handoff",
          "collaborate",
          "createDoc",
          "getGates",
          "approvePlan",
          "setAutonomous"
        ],
        "description": "Action to perform"
      },
      "from": {
        "description": "(handoff) Agent handing off (e.g., feature-developer)",
        "type": "string"
      },
      "to": {
        "description": "(handoff) Agent receiving (e.g., code-reviewer)",
        "type": "string"
      },
      "artifacts": {
        "description": "(handoff) Artifacts to hand off",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "topic": {
        "description": "(collaborate) Collaboration topic",
        "type": "string"
      },
      "participants": {
        "description": "(collaborate) Participating roles",
        "type": "array",
        "items": {
          "type": "string",
          "enum": [
            "planner",
            "designer",
            "architect",
            "developer",
            "qa",
            "reviewer",
            "documenter",
            "solo-dev"
          ]
        }
      },
      "type": {
        "description": "(createDoc) Document type",
        "type": "string",
        "enum": [
          "prd",
          "tech-spec",
          "architecture",
          "adr",
          "test-plan",
          "changelog"
        ]
      },
      "docName": {
        "description": "(createDoc) Document name",
        "type": "string"
      },
      "planSlug": {
        "description": "(approvePlan) Plan to approve",
        "type": "string"
      },
      "approver": {
        "description": "(approvePlan) Approving role",
        "type": "string",
        "enum": [
          "planner",
          "designer",
          "architect",
          "developer",
          "qa",
          "reviewer",
          "documenter",
          "solo-dev"
        ]
      },
      "notes": {
        "description": "(approvePlan) Approval notes",
        "type": "string"
      },
      "enabled": {
        "description": "(setAutonomous) Enable/disable",
        "type": "boolean"
      },
      "reason": {
        "description": "(setAutonomous) Reason for change",
        "type": "string"
      }
    },
    "required": [
      "action"
    ],
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
}
```

## workflow-status
```json
{
  "name": "workflow-status",
  "description": "Get current PREVC workflow status including phase, gates, and linked plans.\n\nReturns: Current phase, all phase statuses, gate settings, linked plans, agent activity.",
  "arguments": {
    "type": "object",
    "properties": {},
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
}
```
