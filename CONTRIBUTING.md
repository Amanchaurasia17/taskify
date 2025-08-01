# 🤝 Contributing to TASKIFY

We love your input! We want to make contributing to TASKIFY as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Process](#-development-process)
- [Pull Request Process](#-pull-request-process)
- [Coding Standards](#-coding-standards)
- [Testing Guidelines](#-testing-guidelines)
- [Documentation](#-documentation)
- [Issue Guidelines](#-issue-guidelines)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of:
- Age, body size, disability, ethnicity, gender identity and expression
- Level of experience, education, socio-economic status
- Nationality, personal appearance, race, religion, sexual orientation

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (v5.0 or higher)
- **Git**

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/Amanchaurasia17/taskify.git
   cd taskify
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Amanchaurasia17/taskify.git
   ```

### Local Setup

1. **Install dependencies**:
   ```bash
   # Install backend dependencies
   cd server && npm install

   # Install frontend dependencies
   cd .. && npm install
   ```

2. **Set up environment variables**:
   ```bash
   # Copy example files
   cp .env.example .env
   cp server/.env.example server/.env

   # Edit the files with your configuration
   ```

3. **Start development servers**:
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   npm run dev
   ```

4. **Verify setup**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000
   - API Health: http://localhost:5000/api/health

---

## 🔄 Development Process

### 1. Sync with Upstream

Before starting work, sync with the upstream repository:

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### 2. Create Feature Branch

Create a new branch for your feature:

```bash
git checkout -b feature/amazing-feature
# or
git checkout -b fix/bug-description
# or
git checkout -b docs/documentation-update
```

### 3. Make Changes

- Write your code following our [coding standards](#-coding-standards)
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 4. Commit Changes

Follow conventional commit format:

```bash
git add .
git commit -m "feat: add user notification preferences"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### 5. Push and Create PR

```bash
git push origin feature/amazing-feature
```

Then create a Pull Request on GitHub.

---

## 🎯 Pull Request Process

### Before Submitting

Ensure your PR meets these requirements:

- [ ] **Code Quality**
  - [ ] Follows coding standards
  - [ ] No console.log statements in production code
  - [ ] No commented-out code
  - [ ] Proper error handling

- [ ] **Testing**
  - [ ] All existing tests pass
  - [ ] New tests added for new functionality
  - [ ] Test coverage maintained (>85%)

- [ ] **Documentation**
  - [ ] README updated if needed
  - [ ] API documentation updated
  - [ ] Code comments added for complex logic

- [ ] **Security**
  - [ ] No hardcoded secrets or API keys
  - [ ] Input validation implemented
  - [ ] Security best practices followed

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests that you ran to verify your changes

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: At least 2 reviewers required
3. **Testing**: Manual testing if needed
4. **Approval**: All reviewers must approve
5. **Merge**: Squash and merge preferred

---

## 📝 Coding Standards

### JavaScript/Node.js

```javascript
// Use const/let instead of var
const apiUrl = process.env.API_URL
let userCount = 0

// Use arrow functions for short functions
const getUserById = (id) => users.find(user => user.id === id)

// Use async/await instead of callbacks
const fetchUser = async (id) => {
  try {
    const response = await api.get(`/users/${id}`)
    return response.data
  } catch (error) {
    logger.error('Failed to fetch user:', error)
    throw error
  }
}

// Use descriptive variable names
const isUserAuthenticated = checkAuthStatus(user)
const userNotifications = await getNotifications(userId)

// Add JSDoc comments for functions
/**
 * Creates a new task with validation
 * @param {Object} taskData - The task data
 * @param {string} taskData.title - Task title
 * @param {string} taskData.description - Task description
 * @param {string} userId - ID of the user creating the task
 * @returns {Promise<Object>} Created task object
 */
const createTask = async (taskData, userId) => {
  // Implementation
}
```

### React/Frontend

```jsx
// Use functional components with hooks
import React, { useState, useEffect } from 'react'

const TaskCard = ({ task, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)

  // Use meaningful component names
  const TaskStatusBadge = ({ status }) => (
    <span className={`badge badge-${status}`}>
      {status.toUpperCase()}
    </span>
  )

  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <TaskStatusBadge status={task.status} />
    </div>
  )
}

// Use PropTypes for type checking
import PropTypes from 'prop-types'

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
}
```

### CSS/Styling

```css
/* Use Tailwind CSS utility classes */
.task-card {
  @apply bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow;
}

/* Custom CSS should be minimal and well-organized */
.custom-button {
  @apply px-4 py-2 rounded font-medium;
  
  &.primary {
    @apply bg-blue-500 text-white hover:bg-blue-600;
  }
  
  &.secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
  }
}
```

### File Naming Conventions

```
components/
├── TaskCard.jsx          # PascalCase for components
├── UserProfile.jsx
└── common/
    ├── Button.jsx
    └── Modal.jsx

utils/
├── apiHelpers.js         # camelCase for utilities
├── dateUtils.js
└── validationUtils.js

hooks/
├── useAuth.js            # camelCase with 'use' prefix
├── useTasks.js
└── useNotifications.js

pages/
├── Dashboard.jsx         # PascalCase for pages
├── TaskManagement.jsx
└── UserSettings.jsx
```

---

## 🧪 Testing Guidelines

### Testing Strategy

We use a comprehensive testing approach:

1. **Unit Tests**: Individual functions and components
2. **Integration Tests**: API endpoints and component interactions
3. **E2E Tests**: Complete user workflows

### Frontend Testing

```javascript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskCard } from '../TaskCard'

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    status: 'pending',
    description: 'Test description'
  }

  it('renders task information correctly', () => {
    render(<TaskCard task={mockTask} onUpdate={() => {}} />)
    
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('PENDING')).toBeInTheDocument()
  })

  it('calls onUpdate when edit button is clicked', () => {
    const mockOnUpdate = jest.fn()
    render(<TaskCard task={mockTask} onUpdate={mockOnUpdate} />)
    
    fireEvent.click(screen.getByText('Edit'))
    expect(mockOnUpdate).toHaveBeenCalledWith(mockTask)
  })
})
```

### Backend Testing

```javascript
// API testing with Jest and Supertest
const request = require('supertest')
const app = require('../app')

describe('Tasks API', () => {
  let authToken
  let userId

  beforeAll(async () => {
    // Setup test user and get auth token
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    
    authToken = response.body.data.token
    userId = response.body.data.user._id
  })

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        status: 'pending',
        priority: 'medium'
      }

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.task.title).toBe(taskData.title)
    })
  })
})
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test TaskCard.test.js

# Run E2E tests
npm run test:e2e
```

### Coverage Requirements

- **Minimum coverage**: 85%
- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >90%
- **Lines**: >90%

---

## 📚 Documentation

### Code Documentation

- **Functions**: Use JSDoc comments
- **Components**: Document props and usage
- **APIs**: Update OpenAPI/Swagger specs
- **Complex Logic**: Add inline comments

### README Updates

When adding new features, update:
- Feature list
- Installation instructions
- Usage examples
- API documentation
- Environment variables

### API Documentation

Update the API documentation in `docs/API.md` when:
- Adding new endpoints
- Modifying request/response formats
- Changing authentication requirements
- Adding new error codes

---

## 🐛 Issue Guidelines

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** for solutions
3. **Update to the latest version** if possible
4. **Provide minimal reproduction** example

### Bug Reports

Include the following information:

```markdown
**Describe the Bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g., Windows 10, macOS 12.0, Ubuntu 20.04]
- Browser: [e.g., Chrome 96, Firefox 95, Safari 15]
- Node.js Version: [e.g., 18.0.0]
- App Version: [e.g., 1.0.0]

**Additional Context**
Add any other context about the problem here.
```

### Feature Requests

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of alternative solutions you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

---

## 🏷️ Labels and Milestones

### Issue Labels

- **Type**: `bug`, `feature`, `enhancement`, `documentation`
- **Priority**: `low`, `medium`, `high`, `critical`
- **Status**: `needs-review`, `in-progress`, `blocked`, `ready-to-merge`
- **Area**: `frontend`, `backend`, `api`, `database`, `deployment`
- **Difficulty**: `good-first-issue`, `help-wanted`, `complex`

### Milestones

- **v1.1.0**: Next minor release
- **v2.0.0**: Major release with breaking changes
- **Backlog**: Future considerations

---

## 🎉 Recognition

### Contributors

All contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor appreciation post

### Types of Contributions

We recognize various types of contributions:
- **Code**: Bug fixes, features, performance improvements
- **Documentation**: README, guides, API docs, comments
- **Design**: UI/UX improvements, graphics, icons
- **Testing**: Writing tests, finding bugs, QA
- **Support**: Answering questions, helping users
- **Ideas**: Feature suggestions, architecture discussions

---

## 📞 Getting Help

### Community Support

- **GitHub Discussions**: For questions and general discussions
- **Issues**: For bug reports and feature requests
- **Discord**: Real-time chat and support
- **Email**: Direct contact for sensitive issues

### Maintainer Contact

- **Lead Maintainer**: [your-email@example.com]
- **Core Team**: [team@example.com]
- **Security Issues**: [security@example.com]

---

## 📄 License

By contributing to TASKIFY, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

Thank you for contributing to TASKIFY! 🚀
