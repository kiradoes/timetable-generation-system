# School of Computing Timetable System - Frontend

A modern, computer-aided timetable generation and management system built for the School of Computing.

## 🎯 Overview

This React-based web application provides a comprehensive solution for managing academic timetables across 5 computing departments with role-based access for school officers, department officers, and students.

### Key Features

- **Role-Based Dashboards**: Separate interfaces for School Officers, Department Officers, and Students
- **Smart Scheduling**: Drag-and-drop timetable creation with real-time conflict detection
- **Automated Validation**: Built-in checks for scheduling conflicts, missing courses, and constraint violations
- **Multi-Department Support**: Manage Computer Science, Software Engineering, IT, IS, and Cyber Security
- **PDF Export**: Generate and download timetables as PDF documents
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- Backend server running (see `../backend/README.md`)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Environment Variables

Create a `.env.local` file:

```env
VITE_APP_NAME=Timetable Generation System
VITE_ENVIRONMENT=development
```

## 📁 Project Structure

```
frontend/
├── docs/                      # Documentation
│   ├── FOLDER_STRUCTURE.md   # Detailed folder structure
│   ├── COMPONENT_GUIDE.md    # Component overview
│   ├── QUICK_REFERENCE.md    # Login credentials & features
│   ├── SYSTEM_GUIDE.md       # Complete user guide
│   └── Attributions.md       # Third-party licenses
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components (shadcn/ui)
│   │   └── *.tsx            # Feature components
│   ├── services/            # API communication
│   ├── utils/               # Utility functions
│   └── styles/              # Global styles
├── public/                   # Static assets
└── build/                    # Production build
```

See [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) for detailed structure.




See [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) for complete feature list.

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **PDF Generation**: html2canvas + jsPDF
- **Routing**: React Router (if applicable)

## 📚 Documentation

- **[Folder Structure](docs/FOLDER_STRUCTURE.md)** - Complete directory organization
- **[Component Guide](docs/COMPONENT_GUIDE.md)** - Component overview and relationships
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Login credentials and feature checklist
- **[System Guide](docs/SYSTEM_GUIDE.md)** - Complete user manual
- **[Attributions](docs/Attributions.md)** - Third-party licenses

## 🎨 Design System

The application follows Babcock University's brand guidelines:

- **Primary Color**: Navy Blue (#0f2044)
- **Secondary Color**: Gold (#ffb71b)
- **Font**: Plus Jakarta Sans
- **UI Library**: shadcn/ui components

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Linting & Formatting
npm run lint             # Run ESLint
npm run format           # Format with Prettier
```

## 🌐 API Integration

The frontend communicates with the backend API through the centralized `services/api.js` module.

Default API URL: `http://localhost:5000/api`

All API endpoints are documented in the backend README.

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Follow the existing code structure and conventions
2. Use TypeScript for type safety
3. Follow component naming conventions (see COMPONENT_GUIDE.md)
4. Keep components focused and single-responsibility
5. Use shadcn/ui components for consistency

## 📄 License

This project uses components from [shadcn/ui](https://ui.shadcn.com/) under MIT license.

## 🔗 Related Projects

- Original Design: [Figma File](https://www.figma.com/design/glOE0rHm8K1QKttI0I7sJS/Computer-Aided-Timetable-System)

## 📞 Support

For issues or questions, please refer to the documentation in the `docs/` folder or contact the development team.
