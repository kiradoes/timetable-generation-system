# Development Guide

## 🛠️ Setup for Development

### 1. Initial Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

### 2. Environment Configuration

Edit `.env.local`:
- `VITE_API_URL`: Backend API URL (default: http://localhost:5000/api)
- `VITE_APP_NAME`: Application name
- `VITE_ENVIRONMENT`: Current environment (development/production)

### 3. Backend Connection

Ensure the backend server is running before starting frontend development:
```bash
# In backend directory
npm start
```

## 📝 Code Organization

### Component Structure

Each component should follow this structure:

```tsx
// 1. Imports
import React from 'react';
import { Button } from './ui/button';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

// 3. Component
export function MyComponent({ title, onAction }: MyComponentProps) {
  // 4. Hooks
  const [state, setState] = React.useState('');

  // 5. Functions
  const handleClick = () => {
    // logic here
  };

  // 6. Render
  return (
    <div>
      {/* JSX here */}
    </div>
  );
}
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `DashboardLayout.tsx`)
- **Utils/Services**: camelCase (e.g., `pdfGenerator.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### Component Categories

1. **Page Components**: Main route components (e.g., `Dashboard.tsx`)
2. **Feature Components**: Specific features (e.g., `TimetableScheduler.tsx`)
3. **UI Components**: Reusable UI elements in `components/ui/`
4. **Layout Components**: Structure components (e.g., `DashboardLayout.tsx`)

## 🎨 Styling Guidelines

### Tailwind CSS

Use Tailwind utility classes for styling:

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-navy-blue">Title</h1>
</div>
```

### Theme Colors

Use CSS variables defined in `src/styles/globals.css`:

```tsx
// Primary (Navy Blue)
className="bg-primary text-primary-foreground"

// Destructive (Red)
className="bg-destructive text-destructive-foreground"

// Muted
className="bg-muted text-muted-foreground"
```

### Custom Classes

For complex or reusable styles, add to `globals.css`:

```css
.custom-gradient {
  background: linear-gradient(135deg, #0f2044 0%, #1a3a6e 100%);
}
```

## 🔌 API Integration

### Using the API Service

Import and use the centralized API service:

```tsx
import api from '../services/api';

// GET request
const fetchData = async () => {
  try {
    const response = await api.get('/courses');
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// POST request
const createData = async (data) => {
  try {
    const response = await api.post('/courses', data);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### Error Handling

Always handle API errors gracefully:

```tsx
try {
  const data = await api.get('/endpoint');
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('Server error:', error.response.data);
  } else if (error.request) {
    // No response received
    console.error('Network error');
  } else {
    // Other errors
    console.error('Error:', error.message);
  }
}
```

## 🧩 Working with UI Components

### shadcn/ui Components

All UI components are in `src/components/ui/`. Import and use them:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="default">Click Me</Button>
  </CardContent>
</Card>
```

### Common UI Patterns

#### Dialogs/Modals
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

#### Tables
```tsx
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.value}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## 🐛 Debugging

### React DevTools

Install React Developer Tools browser extension for component inspection.

### Console Logging

Use meaningful log messages:

```tsx
console.log('[ComponentName] Action:', data);
console.error('[ComponentName] Error:', error);
```

### API Request Debugging

Check Network tab in browser DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by XHR/Fetch
4. Inspect request/response

## ✅ Best Practices

### 1. Component Reusability

Extract reusable logic into separate components:

```tsx
// Bad: Repeating code
<div className="p-4 bg-white rounded">Content 1</div>
<div className="p-4 bg-white rounded">Content 2</div>

// Good: Reusable component
const Card = ({ children }) => (
  <div className="p-4 bg-white rounded">{children}</div>
);

<Card>Content 1</Card>
<Card>Content 2</Card>
```

### 2. State Management

Keep state close to where it's used:

```tsx
// Bad: Unnecessary global state
const [allState, setAllState] = useState({...});

// Good: Component-level state
const [loading, setLoading] = useState(false);
const [data, setData] = useState([]);
```

### 3. TypeScript Usage

Always define types for props and data:

```tsx
// Define types
interface Course {
  id: number;
  code: string;
  title: string;
  credits: number;
}

// Use in component
interface CourseListProps {
  courses: Course[];
  onSelect: (course: Course) => void;
}

export function CourseList({ courses, onSelect }: CourseListProps) {
  // Component logic
}
```

### 4. Performance

Use React.memo for expensive components:

```tsx
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});
```

Avoid inline functions in render:

```tsx
// Bad
<Button onClick={() => handleClick(id)}>Click</Button>

// Good
const onClick = useCallback(() => handleClick(id), [id]);
<Button onClick={onClick}>Click</Button>
```

## 🧪 Testing

### Manual Testing Checklist

Before committing changes:
- [ ] Component renders without errors
- [ ] All buttons and interactions work
- [ ] API calls succeed/fail gracefully
- [ ] Responsive design works on mobile
- [ ] No console errors or warnings

## 📦 Building for Production

```bash
# Create production build
npm run build

# Test production build locally
npm run preview
```

The build output will be in the `build/` directory.

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add: my feature description"

# Push to remote
git push origin feature/my-feature
```

### Commit Message Format

- `Add:` - New features
- `Fix:` - Bug fixes
- `Update:` - Updates to existing features
- `Refactor:` - Code refactoring
- `Docs:` - Documentation changes
- `Style:` - Code style/formatting changes

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Vite Guide](https://vitejs.dev/guide/)

## 🆘 Common Issues

### Port Already in Use

```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Connection Failed

1. Check backend is running on correct port
2. Verify `VITE_API_URL` in `.env.local`
3. Check CORS settings in backend

### Build Errors

```bash
# Clear cache and rebuild
rm -rf build node_modules/.vite
npm run build
```
