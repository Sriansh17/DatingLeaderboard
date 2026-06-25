## 🧠 Fond — AI Knowledge Base & Agents

I've set up a persistent AI knowledge base for the Fond codebase. Here's what it does and how to use it.

### What It Is

`docs/ai-context/` contains 12 markdown files documenting everything about Fond — product, features, architecture, APIs, design system, components, user flows, business rules, product decisions, known issues, and engineering conventions. A new dev or AI can read only this folder and fully understand the product without re-exploring the codebase.

### How the AI Uses It

You don't need to memorize tags or modes. Just describe what you want in normal language. The AI automatically detects what kind of work it is, loads the relevant documentation, and follows our conventions.

Examples:
- "Fix the welcome ceremony — it fires on every post" → AI detects Frontend + Logic bug, already knows about the PostForm.tsx:138 issue, loads the right context, fixes it
- "Add a daily post cap for free users" → AI detects Business Logic, already knows the cap is 2/day and the Supabase pattern
- "Scan for dead components" → AI detects Audit, already knows about BottomNav, MobileNav, StoryCard dead variants

If a request is vague, the AI will ask 2-3 clarifying questions before writing code — no wasted work.

### How to Use It

```bash
npm install -g @anthropic-ai/claude-code
cd DatingLeaderboard
claude login
claude
```

Then just talk to it like a teammate:
- "Fix the toast — it's blocking the whole UI"
- "Add pagination to the explore feed"
- "What technical debt should we prioritize?"

### Where Things Live

```
DatingLeaderboard/
├── CLAUDE.md                   ← Agent definitions, project rules
├── docs/ai-context/           ← Knowledge base (12 files)
│   ├── 01-product-overview.md
│   ├── ...
│   └── 12-ai-development-guide.md
└── PRODUCT_AUDIT.md           ← Full audit findings
```

---

That's it. Copy and send wherever your team communicates.
