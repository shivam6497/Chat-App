# Chat App

A real-time chat application built with a TypeScript Socket.IO backend and a Vite + React frontend.

# Live Demo

[https://chat-app-phi-beige-20.vercel.app](https://chat-app-phi-beige-20.vercel.app)

## Project Structure

- `Backend/` - Express + Socket.IO server written in TypeScript
- `Frontend/` - React client built with Vite, TypeScript, and Tailwind CSS

## Features

- Create or join a chat room with a short room code
- Send real-time messages through Socket.IO
- See system messages when users join or leave
- View room history and the current user list

## Requirements

- Node.js 18 or newer
- npm

## Backend

The backend runs on port `8080` and exposes a health check at `GET /health`.

### Install

```bash
cd Backend
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

## Frontend

The frontend is a Vite app. It currently connects to the deployed Socket.IO server configured in the `Frontend/src/socket.ts` file.

### Install

```bash
cd Frontend
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Local Development Notes

- If you want to run the frontend against a local backend, update the socket server URL in `Frontend/src/socket.ts`.
- The backend allows CORS from the deployed frontend URL listed in `Backend/src/server.ts`.

## Quick Start

1. Start the backend from `Backend/`.
2. Start the frontend from `Frontend/`.
3. Open the frontend in your browser and create or join a room.
