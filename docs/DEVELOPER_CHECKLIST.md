# 🚀 Frontend Developer Checklist

A quick checklist for developers getting started or contributing to the BUCC Timetable Management System frontend.

## ✅ Initial Setup

- [ ] Clone the repository
- [ ] Navigate to `frontend/` directory
- [ ] Run `npm install` to install dependencies
- [ ] Copy `.env.example` to `.env.local`
- [ ] Update `.env.local` with your environment variables
- [ ] Run `npm run dev` to start development server
- [ ] Verify application loads at `http://localhost:5173`
- [ ] Ensure backend is running at `http://localhost:5000`

## 📚 Learning the Codebase

- [ ] Read the [README.md](../README.md) for project overview
- [ ] Check [docs/INDEX.md](INDEX.md) for documentation guide
- [ ] Review [docs/FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) to understand organization
- [ ] Study [docs/COMPONENT_GUIDE.md](COMPONENT_GUIDE.md) for component reference
- [ ] Test login with credentials from [docs/QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- [ ] Explore the [docs/SYSTEM_GUIDE.md](SYSTEM_GUIDE.md) to understand features

## 🛠️ Development Setup

- [ ] Install recommended VS Code extensions
  - [ ] ES7+ React/Redux/React-Native snippets
  - [ ] Tailwind CSS IntelliSense
  - [ ] TypeScript Vue Plugin (if using Vue)
  - [ ] Prettier - Code formatter
  - [ ] ESLint
- [ ] Configure VS Code settings for consistent formatting
- [ ] Create a `.env.local` file with proper variables
- [ ] Verify API connection to backend

## 💻 Before Starting Development

- [ ] Read [docs/DEVELOPMENT.md](DEVELOPMENT.md) completely
- [ ] Understand the component structure
- [ ] Review code organization patterns
- [ ] Check naming conventions
- [ ] Familiarize yourself with Tailwind CSS
- [ ] Learn shadcn/ui component patterns
- [ ] Understand TypeScript patterns used in project

## 🧩 Working with Components

### Creating New Components

- [ ] Use PascalCase for component file names
- [ ] Include proper TypeScript types/interfaces
- [ ] Follow component structure pattern (imports → types → component)
- [ ] Use shadcn/ui components for consistency
- [ ] Add prop documentation with JSDoc comments
- [ ] Handle error states gracefully
- [ ] Consider component reusability

### Modifying Existing Components

- [ ] Understand current component purpose
- [ ] Check where component is used before modifying
- [ ] Update related tests if they exist
- [ ] Maintain backward compatibility if possible
- [ ] Update TypeScript types
- [ ] Test all affected features

## 🎨 Styling

- [ ] Use Tailwind utility classes for styling
- [ ] Reference theme colors from CSS variables
- [ ] Maintain responsive design
- [ ] Use consistent spacing (follow Tailwind scale)
- [ ] Test dark mode if supported
- [ ] Don't use inline styles (use Tailwind/CSS)
- [ ] Check color contrast for accessibility

## 🔌 API Integration

- [ ] Use centralized `services/api.js` for all API calls
- [ ] Handle loading states
- [ ] Handle error states with user-friendly messages
- [ ] Use proper HTTP methods (GET, POST, PUT, DELETE)
- [ ] Check backend API documentation
- [ ] Test API calls with mock data if needed
- [ ] Implement retry logic for failed requests
- [ ] Log API errors for debugging

## 🧪 Testing Your Work

### Before Committing

- [ ] Component renders without console errors
- [ ] All interactive elements work correctly
- [ ] API calls succeed and handle errors
- [ ] Form validation works
- [ ] Data displays correctly
- [ ] Responsive design works on mobile (test in DevTools)
- [ ] Dark mode works if applicable
- [ ] No console warnings
- [ ] No TypeScript errors

### Manual Testing Scenarios

- [ ] Test with different user roles (if applicable)
- [ ] Test with empty data states
- [ ] Test with large data sets
- [ ] Test with network errors
- [ ] Test pagination/sorting if implemented
- [ ] Test search/filter functionality
- [ ] Test form submissions
- [ ] Test error messages

## 🐛 Debugging

- [ ] Use React DevTools browser extension
- [ ] Check browser console for errors/warnings
- [ ] Use Network tab to debug API calls
- [ ] Add console.log for debugging (remove before commit)
- [ ] Use debugger breakpoints
- [ ] Check component props in React DevTools
- [ ] Verify API responses match expectations

## 📝 Code Quality

- [ ] Follow naming conventions from [docs/DEVELOPMENT.md](DEVELOPMENT.md#file-naming-conventions)
- [ ] Keep components focused and single-responsibility
- [ ] Extract reusable logic
- [ ] Use TypeScript types properly
- [ ] Avoid inline functions in render
- [ ] Handle null/undefined values
- [ ] Use early returns to keep nesting shallow
- [ ] Add comments for complex logic

## 🔄 Git Workflow

- [ ] Create feature branch: `git checkout -b feature/my-feature`
- [ ] Make meaningful commits with clear messages
- [ ] Follow commit message format:
  - `Add:` for new features
  - `Fix:` for bug fixes
  - `Update:` for updates
  - `Refactor:` for refactoring
  - `Docs:` for documentation
- [ ] Keep commits atomic and focused
- [ ] Push to remote: `git push origin feature/my-feature`
- [ ] Create pull request with clear description

## 📦 Before Pushing to Repository

- [ ] No console errors or warnings
- [ ] No unused imports
- [ ] No commented-out code
- [ ] No debugging console.logs
- [ ] Consistent code formatting
- [ ] All types properly defined
- [ ] No TypeScript errors
- [ ] Tests pass (if applicable)
- [ ] README/docs updated if needed
- [ ] Git history is clean

## 🚀 Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing
- [ ] No console errors
- [ ] API URLs correct for environment
- [ ] Environment variables documented
- [ ] Build succeeds: `npm run build`
- [ ] Build output verified
- [ ] Performance acceptable
- [ ] Accessibility checked
- [ ] Cross-browser tested

## 🆘 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
npx kill-port 5173
npm run dev
```

#### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

#### API Connection Failed
- Check backend is running on correct port
- Verify `VITE_API_URL` in `.env.local`
- Check browser Network tab for failed requests

#### Build Errors
```bash
rm -rf build node_modules/.vite
npm run build
```

#### TypeScript Errors
- Check type definitions
- Hover over error to see suggestion
- Review [docs/DEVELOPMENT.md](DEVELOPMENT.md#-typescript-usage)

## 📚 Documentation to Review

| Document | Purpose |
|----------|---------|
| [README.md](../README.md) | Project overview |
| [docs/INDEX.md](INDEX.md) | Documentation navigation |
| [docs/FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) | Project organization |
| [docs/COMPONENT_GUIDE.md](COMPONENT_GUIDE.md) | Component reference |
| [docs/DEVELOPMENT.md](DEVELOPMENT.md) | Development guide |
| [docs/QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Quick reference |
| [docs/SYSTEM_GUIDE.md](SYSTEM_GUIDE.md) | User manual |
| [docs/CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) | Cleanup details |

## 🎯 First Task Suggestions

1. **Understand the structure**
   - Read the folder structure doc
   - Explore component directory
   - Identify your work area

2. **Make a small fix**
   - Find a simple issue
   - Create a feature branch
   - Make the change
   - Test locally
   - Push and create PR

3. **Build a new component**
   - Follow the component structure
   - Use existing components as reference
   - Use shadcn/ui for UI elements
   - Add proper TypeScript types
   - Test thoroughly

4. **Fix a bug**
   - Reproduce the issue
   - Debug using DevTools
   - Find root cause
   - Implement fix
   - Verify fix works
   - Check for regression

## 💡 Tips for Success

- **Ask questions** - No question is too basic
- **Read existing code** - Great source of patterns
- **Test thoroughly** - Catch issues early
- **Keep commits small** - Easier to review
- **Document changes** - Update docs if needed
- **Review PR feedback** - Learn and improve
- **Run linter** - Keep code consistent
- **Use TypeScript** - Catch errors early

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Ready to contribute?** Follow this checklist and refer to the documentation as needed. Happy coding! 🚀

**Need help?** Check [docs/DEVELOPMENT.md](DEVELOPMENT.md#-common-issues) or ask the team.
