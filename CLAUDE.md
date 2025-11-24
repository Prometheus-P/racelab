# CLAUDE.md - AI Assistant Guide for krace

This document provides comprehensive guidance for AI assistants working on the krace project.

## Project Overview

**Repository:** Prometheus-P/krace
**Status:** Early stage development
**Purpose:** Race condition detection and analysis tool

### Project Context

The krace project is in its initial development phase. The repository currently contains minimal structure, providing an opportunity to establish solid foundations for the codebase.

## Repository Structure

```
krace/
├── README.md           # Project documentation
├── CLAUDE.md          # This file - AI assistant guide
└── .git/              # Git repository metadata
```

### Expected Future Structure

As the project develops, anticipate the following structure:

```
krace/
├── cmd/               # Command-line entry points
├── pkg/               # Public library packages
├── internal/          # Private application code
├── docs/              # Documentation
├── examples/          # Usage examples
├── test/              # Test files and test data
├── scripts/           # Build and automation scripts
├── .github/           # GitHub Actions and workflows
├── Makefile           # Build automation
└── README.md          # Project documentation
```

## Development Workflows

### Git Workflow

- **Current Branch:** `claude/claude-md-mid5f0cok9q4jwml-01JsPTGJth7mU7hxirtfRitW`
- **Branching Strategy:** Feature branches with descriptive names
- **Commit Messages:** Clear, descriptive, following conventional commits format
  - Format: `type(scope): subject`
  - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
  - Example: `feat(detector): add race condition detection algorithm`

### Git Push Requirements

- Always use: `git push -u origin <branch-name>`
- Branch naming: Must start with `claude/` and end with matching session ID
- Retry logic: If push fails due to network errors, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

### Git Operations Best Practices

- Prefer fetching specific branches: `git fetch origin <branch-name>`
- Use clear commit messages that explain the "why" not just the "what"
- Keep commits atomic and focused on single concerns
- Never force push to main/master without explicit permission

## Code Conventions

### General Principles

1. **Simplicity First:** Avoid over-engineering. Implement what's needed now, not what might be needed.
2. **No Premature Abstraction:** Three similar lines are better than a premature abstraction.
3. **Delete Unused Code:** No backwards-compatibility hacks. Delete unused code completely.
4. **Security Awareness:** Watch for OWASP top 10 vulnerabilities:
   - Command injection
   - XSS
   - SQL injection
   - Insecure deserialization
   - Authentication/authorization issues

### Naming Conventions

- **Variables:** descriptive, camelCase for most languages
- **Functions:** verb-based, clear action indicators
- **Files:** lowercase with hyphens or underscores depending on language conventions
- **Packages/Modules:** short, lowercase, singular nouns

### Code Quality Standards

- **Comments:** Only where logic isn't self-evident. Code should be self-documenting.
- **Error Handling:** Only at system boundaries (user input, external APIs). Trust internal code.
- **Testing:** Write tests for critical paths and complex logic. Avoid testing trivial code.
- **Documentation:** Focus on "why" and "how to use", not "what" (code shows what).

## File Operations

### Tool Usage Guidelines

Always prefer specialized tools over bash commands:

- **Read files:** Use `Read` tool, not `cat/head/tail`
- **Edit files:** Use `Edit` tool, not `sed/awk`
- **Write files:** Use `Write` tool, not `echo >` or `cat <<EOF`
- **Search files:** Use `Glob` for file patterns, `Grep` for content
- **Communication:** Output text directly, never use `echo` in bash for messages

### File Modification Policy

- **ALWAYS** prefer editing existing files over creating new ones
- **NEVER** create files unless absolutely necessary
- **READ FIRST:** Always read a file before modifying it
- Avoid creating unnecessary documentation files unless explicitly requested

## Testing Practices

### Testing Philosophy

- Test critical paths and complex logic
- Avoid testing trivial code or framework functionality
- Use table-driven tests where applicable
- Mock external dependencies, not internal functions
- Test behavior, not implementation

### Test Organization

```
test/
├── unit/          # Unit tests
├── integration/   # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data and fixtures
```

## Task Management

### Todo System Usage

AI assistants should actively use the TodoWrite tool for:

- **Multi-step tasks:** 3+ distinct steps
- **Complex tasks:** Requiring careful planning
- **Multiple user requests:** Lists of tasks
- **Progress tracking:** To show users what's being done

### Todo Best Practices

1. **Task States:**
   - `pending`: Not yet started
   - `in_progress`: Currently working (ONLY ONE at a time)
   - `completed`: Finished successfully

2. **Task Descriptions:**
   - `content`: Imperative form (e.g., "Run tests")
   - `activeForm`: Present continuous (e.g., "Running tests")

3. **Task Management:**
   - Mark completed immediately after finishing
   - Keep exactly ONE task as in_progress
   - Remove tasks that become irrelevant
   - Only mark completed when fully accomplished

4. **When NOT to use:**
   - Single, straightforward tasks
   - Trivial operations
   - Purely conversational requests

## Project-Specific Considerations

### Race Detection Context

This project focuses on race condition detection. Key considerations:

1. **Concurrency Patterns:** Be mindful of threading, async operations, and parallel execution
2. **Determinism:** Race conditions are non-deterministic; testing strategies should account for this
3. **Performance:** Detection tools often need to run with minimal overhead
4. **Instrumentation:** May require code instrumentation or runtime analysis
5. **Reporting:** Clear, actionable reports about detected races

### Technology Stack

The project language/framework is yet to be determined. Common choices for race detection tools:

- **Go:** Excellent concurrency primitives, built-in race detector
- **Rust:** Memory safety, strong type system
- **C/C++:** Low-level system access, performance
- **Python:** Rapid prototyping, extensive libraries

When technology choices are made, update this section accordingly.

## Security Considerations

### Authorized Use Cases

- Security testing (with authorization)
- Defensive security
- CTF challenges
- Educational contexts
- Penetration testing engagements
- Security research

### Prohibited Activities

- Destructive techniques
- DoS attacks
- Mass targeting
- Supply chain compromise
- Detection evasion for malicious purposes

## Communication Style

### For AI Assistants

- Be concise and direct
- Use technical accuracy over validation
- No emojis unless explicitly requested
- Output text for communication, not bash commands
- Focus on facts and problem-solving
- Disagree when necessary; objective guidance over false agreement

### Documentation Style

- Use GitHub-flavored markdown
- Include code references with `file_path:line_number` format
- Keep explanations focused and practical
- Prefer bullet points and structured information
- Include examples where helpful

## Common Operations

### Starting a New Feature

1. Create feature branch: `git checkout -b feature/descriptive-name`
2. Create TodoWrite plan for the feature
3. Read relevant existing code
4. Implement incrementally
5. Test thoroughly
6. Commit with clear messages
7. Push to origin

### Fixing a Bug

1. Reproduce the issue
2. Identify root cause (read relevant code)
3. Create minimal fix (no surrounding refactoring)
4. Test the fix
5. Commit: `fix(component): brief description of fix`
6. Push to origin

### Adding Tests

1. Identify what needs testing
2. Choose appropriate test level (unit/integration/e2e)
3. Write focused tests
4. Ensure tests fail without the implementation
5. Verify tests pass with implementation
6. Commit: `test(component): add tests for X`

### Updating Documentation

1. Read existing documentation
2. Make targeted updates (no unnecessary changes)
3. Ensure accuracy and clarity
4. Commit: `docs: update X documentation`

## Exploration Guidelines

### When to Use Task Tool with Explore Agent

Use the Task tool with `subagent_type=Explore` for:

- Understanding codebase structure
- Finding where functionality is implemented
- Answering "how does X work?" questions
- Non-specific searches requiring context

### Direct Tool Usage

Use Grep/Glob directly for:

- Finding specific file/class/function (needle queries)
- Known patterns or strings
- Quick lookups

## Build and Deployment

### Build Process

To be established as project develops. Common patterns:

- **Makefile:** `make build`, `make test`, `make clean`
- **Package managers:** Language-specific (npm, cargo, go build, etc.)
- **CI/CD:** GitHub Actions for automated testing and deployment

### Continuous Integration

When CI is set up, ensure:

- All tests pass before merging
- Linting and formatting checks pass
- Build succeeds on target platforms
- Security scans complete

## Version Control Practices

### Commit Guidelines

1. **Atomic commits:** One logical change per commit
2. **Clear messages:** Explain why, not just what
3. **Reference issues:** Include issue numbers when applicable
4. **Test before commit:** Ensure code works

### Branch Management

- Keep branches focused on single features/fixes
- Regularly sync with main branch
- Delete branches after merging
- Use descriptive branch names

### Pull Request Process

1. Ensure all tests pass
2. Write clear PR description with:
   - Summary of changes
   - Test plan
   - Related issues
3. Use `gh pr create` with proper format
4. Address review feedback promptly

## Troubleshooting

### Common Issues

1. **Push failures:** Check branch naming (must start with `claude/`)
2. **Test failures:** Run locally before committing
3. **Build errors:** Check dependencies and build configuration
4. **Merge conflicts:** Resolve carefully, test after resolution

### Getting Help

- Check project documentation
- Review existing code for patterns
- Search for similar issues in git history
- Ask user for clarification when needed

## Evolution of This Document

This CLAUDE.md should evolve with the project:

- **Add** new conventions as they're established
- **Update** structure as codebase grows
- **Remove** outdated information
- **Refine** guidelines based on project experience

When making significant changes to project architecture or conventions, update this document to reflect current best practices.

---

**Last Updated:** 2025-11-24
**Document Version:** 1.0.0
**Status:** Active Development
