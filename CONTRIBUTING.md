# Contributing to EquiSight

First off, thank you for considering contributing to EquiSight! It's people like you that make EquiSight such a great tool for the investment community.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/opensource-ai-equity-research.git
   cd opensource-ai-equity-research
   ```
3. **Add the original repository as upstream**:
   ```bash
   git remote add upstream https://github.com/original-owner/opensource-ai-equity-research.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Set up your development environment** (see README.md)

### Making Changes

1. **Create a new branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly:
   ```bash
   npm run dev      # Test in development
   npm run build    # Test production build
   npm run lint     # Check code style
   ```
4. **Commit your changes** using conventional commits:
   ```bash
   git commit -m "feat: add new stock analysis feature"
   ```

### Submitting Changes

1. **Push your changes** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. **Create a Pull Request** on GitHub
3. **Describe your changes** in detail in the PR description
4. **Link any related issues** using keywords like "Closes #123"

## Coding Standards

### TypeScript/React Guidelines

* Use **TypeScript** for all new code
* Follow **React hooks** patterns and best practices
* Use **functional components** over class components
* Implement proper **error boundaries** where appropriate
* Use **TypeScript interfaces** for all data structures

### Code Style

* We use **ESLint** and **Prettier** for code formatting
* Run `npm run lint` before committing
* Use **meaningful variable and function names**
* Add **JSDoc comments** for complex functions
* Keep functions **small and focused**

### Component Guidelines

* Use **Shadcn/ui components** when possible
* Create **reusable components** in `src/components/ui/`
* Use **Tailwind CSS** with semantic design tokens
* Implement **proper accessibility** (ARIA labels, keyboard navigation)
* Follow **responsive design** principles

### API Guidelines

* All API calls should go through **Supabase Edge Functions**
* Use **proper error handling** and user feedback
* Implement **loading states** for all async operations
* Add **proper TypeScript types** for all API responses
* Use **React Query** for data fetching and caching

## Database Changes

* All database changes must be done through **Supabase migrations**
* Include **RLS policies** for all user-related tables
* Add **proper indexes** for query performance
* Use **descriptive column names** and comments
* Test migrations on a development instance first

## Testing

* Write **unit tests** for utility functions
* Add **integration tests** for complex features
* Test **edge cases** and error conditions
* Ensure **accessibility compliance**
* Test on multiple **browsers and devices**

## Documentation

* Update **README.md** for any setup changes
* Add **JSDoc comments** for new functions
* Update **API documentation** for new endpoints
* Include **examples** in documentation
* Keep documentation **up to date** with code changes

## Security

* **Never commit** API keys or sensitive data
* Use **environment variables** for configuration
* Follow **OWASP** security guidelines
* Validate **all user inputs**
* Use **parameterized queries** only

## Performance

* Optimize **bundle size** and loading times
* Use **React.memo** and **useMemo** appropriately
* Implement **proper caching** strategies
* Optimize **images and assets**
* Monitor **Core Web Vitals**

## Commit Messages

We use [Conventional Commits](https://conventionalcommits.org/) for our commit messages:

* `feat: add new feature`
* `fix: resolve bug in component`
* `docs: update README with new instructions`
* `style: format code with prettier`
* `refactor: reorganize component structure`
* `test: add unit tests for utility functions`
* `chore: update dependencies`

## Release Process

1. All changes go through **pull request review**
2. Changes are merged to **main branch**
3. **Automated tests** run on all changes
4. **Semantic versioning** is used for releases
5. **Release notes** are generated automatically

## Getting Help

* Join our **Discord community** for real-time help
* Check existing **GitHub issues** and discussions
* Read the **documentation** thoroughly
* Ask questions in **pull request comments**

## Recognition

Contributors will be recognized in:

* **README.md acknowledgments**
* **Release notes** for significant contributions
* **GitHub contributors** section
* **Annual contributor highlights**

Thank you for contributing to EquiSight! 🚀