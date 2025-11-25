# AI Agent Rules

This project follows strict TDD (Test-Driven Development) principles based on Kent Beck's methodology.

**CRITICAL**: All AI agents working on this codebase MUST read and strictly follow the rules defined in:

📋 **[TDD_RULES.md](file:///Users/admin/Documents/dev/krace/docs/TDD_RULES.md)**

## Quick Reference

### Core Principles
1. **Red → Green → Refactor** cycle is mandatory
2. **Never mix** structural changes with behavioral changes
3. **All commits** must have passing tests
4. **Tidy First**: Clean structure before adding features
5. **Small commits**: One logical unit per commit

### Before Every Change
- [ ] Is there a failing test? (Red)
- [ ] Does the implementation pass the test? (Green)
- [ ] Is refactoring needed? (Only in Green state)
- [ ] Are structural and behavioral changes separated?
- [ ] Do all tests pass before committing?

### Commit Types
- `chore(structure):` - Structural changes only
- `feat(behavior):` - New features with tests
- `fix(behavior):` - Bug fixes with tests
- `test:` - Test additions/modifications
- `docs:` - Documentation updates

## Workflow Command

When you receive `"go"`:
1. Define the next test to write
2. Write failing test (Red)
3. Minimal implementation (Green)
4. Refactor if needed
5. Commit with proper separation

---

**For complete rules, always refer to [TDD_RULES.md](file:///Users/admin/Documents/dev/krace/docs/TDD_RULES.md)**
