# Contributing to VaultaYield

Thank you for considering contributing to VaultaYield! This document provides guidelines for contributions.

---

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Prioritize protocol security

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or inflammatory comments
- Publishing others' private information
- Other unprofessional conduct

---

## How to Contribute

### Reporting Bugs

**Before submitting:**
1. Check existing issues
2. Verify it's not a testnet-specific issue
3. Gather transaction IDs and details

**Submit via GitHub Issues:**
```
Title: Clear, descriptive title
Body:
- What happened?
- What did you expect?
- Steps to reproduce
- Transaction IDs
- Environment (wallet, browser, etc.)
```

### Suggesting Features

We welcome feature suggestions! Please:

1. Check existing feature requests
2. Explain the use case
3. Describe expected behavior
4. Consider security implications

### Code Contributions

**Types of contributions:**
- Bug fixes
- Documentation improvements
- Test coverage increases
- Gas optimizations
- New features (discuss first!)

---

## Development Setup

### Prerequisites

```bash
# Install Clarinet
curl -L https://github.com/hirosystems/clarinet/releases/download/latest | sh

# Install Node.js (v18+)
# https://nodejs.org/

# Install dependencies
npm install
```

### Project Structure

```
vaultayield/
├── contracts/           # Clarity smart contracts
├── tests/               # Clarinet tests
├── scripts/             # Deployment & test scripts
├── docs/                # Documentation
└── settings/            # Configuration files
```

---

## Making Changes

### 1. Fork & Clone

```bash
# Fork on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/vaultayield.git
cd vaultayield
```

### 2. Create Branch

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Or bugfix branch
git checkout -b fix/bug-description
```

### 3. Make Changes

**For Smart Contracts:**
```bash
# Edit contracts
vim contracts/vault-core.clar

# Check syntax
clarinet check

# Run tests
clarinet test

# All tests must pass! ✅
```

**For Documentation:**
- Follow existing formatting
- Check links work
- Run spell check
- Keep it concise

### 4. Commit

```bash
# Stage changes
git add -A

# Commit with descriptive message
git commit -m "feat: add feature description"

# Follow conventional commits:
# feat: New feature
# fix: Bug fix
# docs: Documentation changes
# test: Test additions/changes
# refactor: Code refactoring
# chore: Maintenance tasks
```

### 5. Push & PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Fill out the PR template
```

---

## Pull Request Process

### Before Submitting

- [ ] All tests passing
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] Self-review completed
- [ ] No sensitive data committed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Test improvement

## Testing
Describe testing performed

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Self-reviewed
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** run (tests, linting)
2. **Maintainer review** (1-3 days)
3. **Feedback** addressed
4. **Approval** & merge

---

## Development Guidelines

### Smart Contract Development

**Security First:**
```clarity
;; ✅ Good: Input validation
(define-public (deposit (amount uint))
  (begin
    (asserts! (> amount u0) (err u102)) ;; Validate
    ;; ... rest of function
  )
)

;; ❌ Bad: No validation
(define-public (deposit (amount uint))
  ;; ... direct operation
)
```

**Access Control:**
```clarity
;; ✅ Good: Check authorization
(define-public (admin-function)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err u100))
    ;; ... admin operation
  )
)
```

**Gas Optimization:**
```clarity
;; ✅ Good: Read once, use multiple times
(let ((balance (var-get total-balance)))
  (... use balance multiple times ...)
)

;; ❌ Bad: Multiple reads
(var-get total-balance)
(var-get total-balance)
(var-get total-balance)
```

### Testing Standards

**Minimum requirements:**
- Unit tests for all public functions
- Edge case coverage
- Error condition testing
- Integration tests for cross-contract calls

**Example:**
```typescript
it("should reject zero amount deposit", () => {
  const result = simnet.callPublicFn(
    "vault-core",
    "deposit",
    [Cl.uint(0)],
    deployer
  );
  expect(result.result).toBeErr(Cl.uint(102)); // ERR-ZERO-AMOUNT
});
```

### Documentation Standards

**Inline comments:**
```clarity
;; Brief function description
;;
;; @param amount - Amount to deposit in microSTX
;; @returns (response bool uint) - Success or error code
(define-public (deposit (amount uint))
  ...
)
```

**README updates:**
- Keep concise
- Update version numbers
- Add examples
- Link to detailed docs

---

## Security

### Reporting Vulnerabilities

**DO NOT** open public issues for security vulnerabilities!

**Instead:**
1. Email: security@vaultayield.com (or create private GitHub security advisory)
2. Include: Description, impact, reproduction steps
3. Wait for response before public disclosure

**Responsible Disclosure:**
- Give us time to fix (90 days preferred)
- Coordinate disclosure timing
- Credit will be given

### Security Review Checklist

Before submitting contract changes:
- [ ] Access control verified
- [ ] Input validation added
- [ ] Arithmetic safety checked
- [ ] Reentrancy considered (Clarity prevents)
- [ ] No hardcoded values
- [ ] Emergency controls intact

---

## Style Guide

### Clarity Code Style

```clarity
;; Constants: UPPER_SNAKE_CASE
(define-constant ERR-NOT-AUTHORIZED (err u100))

;; Variables: kebab-case
(define-data-var total-assets uint u0)

;; Functions: kebab-case
(define-public (get-share-price)
  ...
)

;; Indentation: 2 spaces
(define-public (example)
  (begin
    (asserts! condition (err u100))
    (ok true)
  )
)
```

### TypeScript/JavaScript Style

```typescript
// Use const/let (not var)
const NETWORK = STACKS_MAINNET;
let nonce = 0;

// Descriptive names
const deployerAddress = getAddress(key);

// Async/await (not callbacks)
const result = await deployContract(name);

// Comments for complex logic
// Calculate share price with 6 decimal precision
const sharePrice = (totalAssets * 1_000_000) / totalShares;
```

---

## Community

### Communication Channels

- **GitHub Discussions**: Feature ideas, questions
- **GitHub Issues**: Bugs, tasks
- **Stacks Discord**: Real-time chat (#DeFi channel)
- **Twitter**: Announcements

### Getting Help

**For contributors:**
- Read existing docs first
- Search closed issues/PRs
- Ask in Discord #dev-help
- Tag @maintainers in complex questions

---

## Recognition

### Contributors

All contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Acknowledged in documentation

### Major Contributors

Significant contributions may earn:
- Protocol governance tokens (future)
- Fee sharing arrangements (TBD)
- Recognition in public communications

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

**Still unsure?** 
- Open a discussion on GitHub
- Ask in Discord
- Email: contribute@vaultayield.com

**We're here to help!** 🚀

---

*Thank you for making VaultaYield better!*

*Last Updated: 2026-01-30*
