# Candy Production Line Monitor

A modern, responsive dashboard for monitoring candy production line operations, built with React, TypeScript, and Tailwind CSS.

## Live Demo

**Production:** https://smart-work-mcd-monitor.netlify.app/

## Features

### Real-time Monitoring
- **Sensor Dashboard**: Live temperature, humidity, pressure, and power consumption metrics
- **System Status**: Real-time operational status with visual indicators
- **Change Tracking**: Visual indicators for metric changes with directional arrows

### Task Management
- **Task List**: Production tasks with status tracking (Pending, In Progress, Completed)
- **Due Date Tracking**: Calendar-based deadline display
- **Progress Statistics**: Overview of task completion rates

### Alert System
- **Warning Journal**: Severity-based alert system (High, Medium, Low)
- **Visual Indicators**: Color-coded warnings with timestamps
- **Alert Management**: Easy-to-scan warning interface

## Tech Stack

### Frontend
- **React 19** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Vite** - Fast build tool and dev server
- **Lucide React** - Beautiful, customizable icons

### Development & Testing
- **Vitest** - Fast unit testing framework
- **Testing Library** - Component testing utilities
- **ESLint** - Code linting and formatting
- **TypeScript ESLint** - TypeScript-specific linting rules

### Build & Deployment
- **GitHub Actions** - Automated CI/CD pipeline
- **Netlify** - Fast, reliable hosting
- **pnpm** - Efficient package management

## Project Structure

```
Monitor/
├── src/
│   ├── components/           # React components
│   │   ├── Dashboard.tsx     # Main dashboard layout
│   │   ├── Sensors.tsx       # Sensor metrics display
│   │   ├── Tasks.tsx         # Task management
│   │   ├── Warnings.tsx      # Alert system
│   │   ├── StatusBadge.tsx   # Reusable status component
│   │   └── __tests__/        # Component tests
│   ├── mocks/               # Mock data for development
│   │   ├── sensorData.json  # Sensor readings
│   │   ├── tasks.json       # Production tasks
│   │   └── warnings.json    # System alerts
│   ├── types/               # TypeScript definitions
│   ├── test/                # Test utilities and setup
│   └── App.tsx              # Root application component
├── public/                  # Static assets
├── dist/                    # Production build output
└── netlify/                 # Deployment configuration
```

## Getting Started

### Prerequisites
- **Node.js 22+**
- **pnpm** (recommended) or npm/yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Monitor
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📋 Available Scripts

### Development
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build locally
```

### Code Quality
```bash
pnpm lint         # Run ESLint
pnpm format       # Fix ESLint issues automatically
pnpm typecheck    # Run TypeScript type checking
```

### Testing
```bash
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once
pnpm test:ui      # Run tests with UI
pnpm test:coverage # Generate coverage report
```

### Environment Variables
```bash
# Production
NETLIFY_AUTH_TOKEN=netlify_auth_token
NETLIFY_SITE_ID=netlify_site_id

# Development
VITE_APP_VERSION=auto_generated
VITE_BUILD_TIME=auto_generated
```
