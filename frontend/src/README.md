# Retirement Simulation App

A modern React application for retirement planning simulations built with TypeScript, Tailwind CSS, and shadcn/ui.

## 🏗️ Architecture Overview

### Phase 1 ✅ - Component Breakdown & Form Optimization
- **Modular Components**: Large components broken into focused, reusable pieces
- **Custom Hooks**: Form state management consolidated with `useSimulationForm`
- **Performance**: Memoization and callback optimization implemented

### Phase 2 ✅ - Structure & Performance
- **Feature-based Structure**: Organized by domain (auth, simulation, results)
- **Lazy Loading**: Code-splitting for better performance
- **Chart Optimization**: Debounced inputs and memoized rendering
- **Error Boundaries**: Global error handling

### Phase 3 ✅ - Polish & Accessibility
- **Semantic Tokens**: Consistent theming using design system
- **Accessibility**: ARIA labels, semantic HTML, screen reader support
- **Code Quality**: Console logs removed, unused imports cleaned

## 📁 Project Structure

```
src/
├── components/           # Shared UI components
│   ├── ui/              # shadcn/ui base components
│   ├── forms/           # Form-specific components
│   └── dashboard/       # Dashboard components
├── features/            # Feature-based modules
│   ├── auth/            # Authentication
│   ├── simulation/      # Simulation logic
│   └── results/         # Results & history
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
├── pages/               # Page components
├── shared/              # Shared across features
│   ├── components/      # Shared components
│   ├── hooks/           # Shared hooks
│   ├── services/        # API services
│   └── utils/           # Shared utilities
└── contexts/            # React Context providers
```

## 🎨 Design System

The app uses a semantic token system defined in:
- `src/index.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind configuration

### Color Usage
Always use semantic tokens instead of direct colors:
```tsx
// ❌ Don't do this
className="bg-white text-black"

// ✅ Do this
className="bg-background text-foreground"
```

## 🚀 Performance Features

- **Code Splitting**: Lazy-loaded pages
- **Memoization**: Chart components optimized
- **Debouncing**: Input handling optimized
- **Error Boundaries**: Graceful error handling

## ♿ Accessibility

- Semantic HTML elements
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader announcements
- Focus management

## 🔧 Development

The project uses modern React patterns:
- Functional components with hooks
- TypeScript for type safety
- React Router v6+ for navigation
- Custom hooks for logic reuse
- Context for global state

## 📦 Key Dependencies

- **React 18**: Latest React features
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library
- **React Hook Form**: Form management
- **Recharts**: Data visualization