# Contributing to Truth Mesh

**Welcome!** Truth Mesh is built in public, and we need your help to make decentralized knowledge verification a reality.

---

## Table of Contents

1. [Ways to Contribute](#ways-to-contribute)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Contribution Guidelines](#contribution-guidelines)
5. [Code of Conduct](#code-of-conduct)
6. [Recognition](#recognition)

---

## Ways to Contribute

### For Developers 💻

**Prototype Development**
- Implement IPFS integration
- Build bias classification system
- Create fork/challenge engine
- Develop API endpoints

**See**: `/prototypes/` directory for work-in-progress

---

### For Researchers 📚

**Architecture Critique**
- Review epistemological model
- Propose reputation algorithms
- Design bias detection methods
- Validate security assumptions

**See**: [ARCHITECTURE.md](ARCHITECTURE.md) for technical spec

---

### For Designers 🎨

**UX/UI Design**
- Sketch fork/diff interfaces
- Design provenance visualizations
- Create user flows
- Prototype web/mobile apps

**See**: `/designs/` directory (to be created)

---

### For Writers ✍️

**Documentation**
- Translate documentation to other languages
- Write tutorials and guides
- Create use case examples
- Explain concepts clearly

**See**: `/docs/` directory for deep dives

---

### For Advocates 📣

**Community Building**
- Share Truth Mesh with relevant communities
- Write blog posts explaining the architecture
- Organize meetups/discussions
- Provide feedback from user perspective

**See**: [Twitter](https://x.com/NomanInnov8) for latest updates

---

## Getting Started

### 1. Read the Core Docs

Before contributing, please read:
- [README.md](README.md) - Project overview
- [MANIFESTO.md](MANIFESTO.md) - The 10-point critique
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical specification
- [ROADMAP.md](ROADMAP.md) - Development plan

---

### 2. Join the Conversation

**GitHub Discussions**:
- Ask questions
- Propose ideas
- Share use cases

**Twitter**:
- Follow [@NomanInnov8](https://x.com/NomanInnov8)
- Use #TruthMesh hashtag
- Engage with updates

---

### 3. Pick an Issue

**Browse**:
- [Good First Issues](https://github.com/XerolandRegent/truth-mesh/labels/good%20first%20issue) - For new contributors
- [Help Wanted](https://github.com/XerolandRegent/truth-mesh/labels/help%20wanted) - For experienced contributors
- [Research Needed](https://github.com/XerolandRegent/truth-mesh/labels/research) - For academics

**Or create your own issue** if you see something missing!

---

## Development Setup

### Prerequisites

**For Prototyping**:
```bash
# Node.js and npm (if building JS prototypes)
node --version  # v18+
npm --version   # v9+

# Python (if building ML prototypes)
python --version  # 3.9+
pip --version

# Git
git --version
```

---

### Clone the Repo

```bash
git clone https://github.com/XerolandRegent/truth-mesh.git
cd truth-mesh
```

---

### Set Up Your Branch

```bash
# Create a new branch for your contribution
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

---

### Install Dependencies

```bash
# If working on specific prototype
cd prototypes/ipfs-integration  # or bias-classifier, etc.
npm install  # or pip install -r requirements.txt
```

---

## Contribution Guidelines

### Submitting Code

**Before submitting**:
1. ✅ Code follows existing style
2. ✅ Tests pass (if applicable)
3. ✅ Documentation updated
4. ✅ Commit messages are clear

**Process**:
```bash
# Make your changes
git add .
git commit -m "feat: add IPFS integration prototype"

# Push to your fork
git push origin feature/your-feature-name

# Open a Pull Request on GitHub
```

---

### PR Template

**Title**: Clear, descriptive (e.g., "feat: implement Merkle proof verification")

**Description**:
```markdown
## What does this PR do?
[Explain the change]

## Why is this needed?
[Explain the problem it solves]

## How was it tested?
[Describe testing approach]

## Screenshots (if applicable)
[Add visuals]

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

---

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code change that neither fixes bug nor adds feature
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(ipfs): add Merkle proof generation
fix(bias): correct classifier confidence calculation
docs(architecture): clarify reputation algorithm
```

---

### Code Style

**JavaScript**:
- Use ESLint with Airbnb config
- Prettier for formatting
- JSDoc for documentation

**Python**:
- Follow PEP 8
- Black for formatting
- Type hints where possible

**Markdown**:
- Use `prettier` for consistency
- Keep lines under 100 characters
- Use reference-style links

---

## Code of Conduct

### Our Pledge

Truth Mesh is committed to providing a welcoming environment for all contributors, regardless of:
- Age, race, ethnicity, nationality
- Gender identity and expression
- Sexual orientation
- Disability
- Physical appearance
- Religion (or lack thereof)
- Technology choices

### Expected Behavior

✅ **Do**:
- Be respectful and inclusive
- Provide constructive feedback
- Accept differing viewpoints
- Focus on what's best for the community
- Show empathy toward others

❌ **Don't**:
- Use sexualized language or imagery
- Make personal attacks
- Publish others' private information
- Engage in trolling or inflammatory comments
- Harass contributors

### Enforcement

Violations of this code will result in:
1. Warning
2. Temporary ban
3. Permanent ban

**Report violations** to [@NomanInnov8](https://x.com/NomanInnov8) privately.

---

## Recognition

### Contributors Hall of Fame

We recognize all contributors in:
- `CONTRIBUTORS.md` file (to be created)
- Release notes
- Social media shoutouts
- Annual community awards

### Levels of Recognition

**🌟 Contributor**: Made at least 1 PR
**⭐⭐ Active Contributor**: 5+ PRs or significant doc contributions
**⭐⭐⭐ Core Contributor**: Maintaining a prototype or major feature
**🏆 Founding Contributor**: Contributed in first 3 months

---

## Questions?

**Not sure where to start?**
- Open a [Discussion](https://github.com/XerolandRegent/truth-mesh/discussions)
- Ask in an existing issue
- DM [@NomanInnov8](https://x.com/NomanInnov8)

**Found a bug?**
- Open an [Issue](https://github.com/XerolandRegent/truth-mesh/issues)
- Describe: What happened, what you expected, how to reproduce

**Have an idea?**
- Open a [Discussion](https://github.com/XerolandRegent/truth-mesh/discussions) first
- Get feedback before building
- Then submit PR

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License (same as the project).

---

**Thank you for helping build the future of knowledge verification!** 🚀

Every contribution—code, docs, design, or discussion—matters.

**Truth isn't owned. It's earned. And we're earning it together.**

---

*Last updated: October 28, 2025*
