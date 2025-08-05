# The Startup Idea Evaluator - AI + Voting App

## Overview

This is a mobile-first web application built for evaluating startup ideas through AI-generated feedback and community voting. Users can submit their startup ideas (name, tagline, description), receive mock AI ratings, vote on other users' ideas, and view a leaderboard of top-rated concepts. The application demonstrates full-stack development skills with a React frontend, Express backend, and PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessible, consistent design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management with optimistic updates
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First Design**: Responsive layout optimized for mobile devices with bottom navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for CRUD operations on ideas and voting
- **Validation**: Zod schemas for request/response validation and type safety
- **Error Handling**: Centralized error middleware with structured error responses

### Data Storage Solution
- **Database**: PostgreSQL with Neon serverless provider
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Data Modeling**: Ideas table with fields for name, tagline, description, AI rating, votes, and views

### Development Features
- **Hot Reloading**: Vite development server with instant updates
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Code Generation**: Automatic type inference from database schema
- **Local Storage**: Client-side persistence for user preferences and voting history

### AI Simulation System
- **Mock AI Rating**: Weighted random distribution (60-95 range) simulating realistic AI evaluation
- **Processing Delay**: Artificial delay to simulate AI processing time for better UX
- **Rating Logic**: Weighted towards higher ratings to encourage user engagement

### Data Persistence Strategy
- **In-Memory Storage**: Development-friendly storage implementation in server/storage.ts
- **PostgreSQL Ready**: Database schema defined but can fall back to memory storage
- **Migration Path**: Drizzle configuration ready for production database deployment

The application uses a modern full-stack architecture with strong typing throughout, mobile-optimized UI patterns, and a scalable data layer ready for production deployment.