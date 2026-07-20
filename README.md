# Chat App

A real-time chat application built with a TypeScript monorepo using Socket.IO, React, Vite, and Redis-backed room state.

## Live Demo

- Frontend: https://chat-app-phi-beige-20.vercel.app
- Backend: https://chat-app-w182.onrender.com

## What it does

- Create or join a chat room with a unique room code
- Send messages in real time with other users in the same room
- See join/leave system notifications
- View room history and the current room member list
- Switch between a light and dark theme

## Tech Stack

- Frontend: React, TypeScript, Vite, Socket.IO Client
- Backend: Express, Socket.IO, TypeScript
- Shared types: local workspace package
- Data layer: Redis adapter for multi-instance room sharing
- Tooling: Turbo for monorepo scripts

## Project Structure

- apps/backend - Socket.IO server and room management logic
- apps/frontend - Vite + React client interface
- packages/types - Shared TypeScript event and message definitions

## Requirements

- Node.js 18+
- npm
- Redis instance (for the backend to connect to)

## Quick Start

1. Install dependencies from the repository root:

```bash
npm install
```

2. Create a backend environment file:

```bash
cp apps/backend/.env.example apps/backend/.env
```

If you do not already have an example file, create apps/backend/.env and add:

```env
REDIS_URL=redis://localhost:6379
```

3. Start the development servers:

```bash
npm run dev
```

This starts the frontend and backend together through Turbo.

4. Open the frontend in your browser and create or join a room.

## Available Scripts

From the repository root:

```bash
npm run dev
npm run build
```

From the backend app:

```bash
cd apps/backend
npm run dev
npm run build
npm start
```

From the frontend app:

```bash
cd apps/frontend
npm run dev
npm run build
npm run lint
```

## Development Notes

- The frontend currently points to the deployed backend URL in apps/frontend/src/socket.ts.
- To test against a local backend, update the server URL there.
- The backend health check endpoint is available at /health.

## Deployment Notes

- The backend uses Socket.IO with Redis for shared room state.
- The frontend is designed to work with a deployed backend URL, but can be pointed at a local one during development.
