# Seek - Creative Face & Audio Effects Web App

## Overview

Seek is a browser-based creative effects application that provides real-time face effects and audio processing for pranks and creative content. The app allows users to upload photos, record/upload audio, apply visual face effects and audio modulation, and export processed content. All processing happens client-side in the browser for privacy - no data leaves the user's device.

Key features include:
- Photo upload with face detection and effects (face swap, aging, beauty filters)
- Audio recording/upload with real-time effects (pitch shift, echo, voice modulation)
- Webcam integration for live preview with applied effects
- Export functionality for processed images and videos
- Dark mode interface with neon accent styling

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using functional components and hooks
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state, React useState for local state
- **Styling**: Tailwind CSS with custom CSS variables for theming (dark mode default with neon purple/blue accents)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Server**: Express.js with TypeScript running on Node.js
- **HTTP Server**: Node's native http module wrapping Express
- **API Pattern**: RESTful routes prefixed with `/api`
- **Development**: Vite dev server with HMR integrated via middleware

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` using Drizzle's pgTable definitions
- **Migrations**: Drizzle Kit with migrations output to `./migrations`
- **Runtime Storage**: MemStorage class for in-memory caching (currently implements user storage)

### Project Structure
```
client/           # Frontend React application
  src/
    components/   # Reusable UI components
    components/ui # shadcn/ui component library
    pages/        # Route page components
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
server/           # Backend Express application
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Data access layer
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema
```

### Design System
- Dark mode by default with deep charcoal backgrounds (#0a0a0f to #151520)
- Neon gradient accents (purple #a855f7 to blue #3b82f6)
- Typography: Inter for body, Space Grotesk for headings
- Glassmorphism effects with backdrop-blur
- Consistent spacing using Tailwind's 4/6/8/12/16/24 scale

## External Dependencies

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **Radix UI**: Headless accessible UI primitives (dialog, tabs, slider, toast, etc.)
- **wouter**: Lightweight React router
- **class-variance-authority**: Component variant styling
- **lucide-react**: Icon library
- **embla-carousel-react**: Carousel component
- **react-day-picker**: Date picker component
- **react-hook-form + zod**: Form handling and validation
- **recharts**: Charting library
- **vaul**: Drawer component

### Backend Libraries
- **express**: Web server framework
- **drizzle-orm + drizzle-kit**: Database ORM and migrations
- **pg**: PostgreSQL client
- **zod**: Schema validation
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type checking
- **tsx**: TypeScript execution for Node
- **esbuild**: Fast bundling for production builds
- **Tailwind CSS + PostCSS + Autoprefixer**: CSS processing

### Database
- **PostgreSQL**: Primary database (requires DATABASE_URL environment variable)
- Schema uses Drizzle ORM with Zod validation for type safety