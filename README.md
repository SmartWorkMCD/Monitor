# Candy Production Line Monitor

A modern, responsive dashboard for monitoring candy production line operations, built with React, TypeScript, and Tailwind CSS. **Now integrated with Workstation Brain for real-time production data.**

## Live Demo

**Production:** https://smart-work-mcd-monitor.netlify.app/

## Features

### Real-time Monitoring
- **Live Workstation Data**: Real-time connection to Workstation Brain via MQTT
- **System Status Tracking**: Monitors workstation states (idle, executing, cleaning, etc.)
- **Task Progress**: Live updates on task execution and completion
- **Performance Metrics**: Task completion times and efficiency tracking

### Task Management Integration
- **Real Task Data**: Displays actual tasks from Workstation Brain
  - T1A: Wrap Red Candies
  - T1B: Wrap Green Candies
  - T1C: Wrap Blue Candies
  - T2A: Assemble Candy Boxes
  - T3A-T3C: Packaging & Finishing
- **Live Status Updates**: Tracks task progress from "started" to "completed"
- **Rule Evaluation**: Shows when production rules are violated

### Smart Alert System
- **Rule-based Warnings**: Alerts when quality rules fail
- **State-based Notifications**: System status changes and confirmations
- **Performance Alerts**: Task completion metrics and timing
- **Severity Classification**: High, Medium, Low priority alerts

## Architecture

### Data Flow
```
Workstation Brain → MQTT Broker → Monitor Dashboard
     (Python)         (WebSocket)      (React)
```

1. **Workstation Brain** publishes events to `management/interface` topic
2. **MQTT Broker** (Eclipse Mosquitto) with WebSocket support on port 8083
3. **Monitor Dashboard** subscribes and displays real-time updates

### Message Types
The Monitor handles these event types from Workstation Brain:

- `system_status` - System state changes (idle, executing, cleaning, etc.)
- `task_update` - Task progress and status updates
- `rule_evaluation` - Production rule compliance results
- `state_transition` - Workstation state changes
- `user_action` - User interactions and confirmations
- `performance_metrics` - Task completion timing and efficiency

## Tech Stack

### Frontend
- **React 19** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Vite** - Fast build tool and dev server
- **MQTT.js** - Real-time MQTT communication

### Integration
- **MQTT WebSocket** - Real-time data from Workstation Brain
- **Eclipse Mosquitto** - MQTT broker with WebSocket support
- **Event-driven Architecture** - Reactive updates from production line

## Project Structure

```
Monitor/
├── src/
│   ├── components/           # React components
│   │   ├── Dashboard.tsx     # Main dashboard layout
│   │   ├── Sensors.tsx       # System metrics display
│   │   ├── Tasks.tsx         # Real task management
│   │   ├── Warnings.tsx      # Alert system
│   │   └── ConnectionStatus.tsx # Workstation connection status
│   ├── services/
│   │   └── MqttService.tsx   # Workstation Brain integration
│   ├── context/
│   │   └── ManagementInterfaceContext.tsx # Real-time data management
│   ├── types/               # TypeScript definitions
│   └── mqtt.config.ts       # MQTT broker configuration
```

## Getting Started

### Prerequisites
- **Node.js 22+**
- **Workstation Brain** running and publishing to MQTT
- **MQTT Broker** (Eclipse Mosquitto) with WebSocket support

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

3. **Configure MQTT connection** (if needed)
   ```typescript
   // src/mqtt.config.ts
   export const mqttConfig = {
     brokerUrl: 'ws://localhost:8083', // WebSocket MQTT
     username: 'admin',
     password: 'admin',
     topics: {
       management: 'management/interface',
       projector: 'projector/control',
       telemetry: 'v1/devices/me/telemetry'
     }
   };
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
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
```

### MQTT Topics
- `management/interface` - Primary data from Workstation Brain
- `projector/control` - Projector status updates (additional context)
- `v1/devices/me/telemetry` - Performance telemetry data
