# Konvos Web Guide

## Overview
Konvos Web is a fully functional messaging and video calling application built with React 18, TypeScript, Vite 7, Tailwind CSS, and **GetStream.io**. It replicates the WhatsApp Web experience with enhanced features like user search, media sharing, and audio/video calls.

## Development Commands
- Install dependencies: `npm install`
- Run production build: `npm run build`
- Launch local preview: `npm run preview`
- Run development server: `npm run dev`

## Application Architecture
- **Entry Point**: `src/main.tsx` mounts `src/App.tsx` wrapped in `BrowserRouter`.
- **Authentication**: `src/context/AuthContext.tsx` manages user sessions. It connects to the backend for secure authentication.
- **Backend**: Located in `server/`. A standard Node.js/Express application using SQLite.
  - `server/src/index.ts`: Express server entry point.
  - `server/src/handlers/auth.ts`: Login/Register logic with bcrypt hashing.
  - `server/src/db.ts`: SQLite connection.
  - `server/schema.sql`: Database schema.
  - `server/README.md`: Detailed deployment guide for Render.
- **Stream Integration**:
  - **Chat**: Powered by `stream-chat-react`. Custom components in `src/components/stream/` override default UI.
  - **Video**: Powered by `@stream-io/video-react-sdk`.
- **Components**:
  - `src/components/KonvosChat.tsx`: Main chat interface.
  - `src/components/stream/CustomChannelListHeader.tsx`: Custom header with User Search.
  - `src/pages/Auth.tsx`: Login and Register screens with password support.

## Configuration
- **Frontend**: 
  - Stream API Key already configured in `src/config.ts` (vfdtvg3uh9b3)
  - Backend URL in `src/config.ts` (currently set to localhost:3000, update after deployment)
- **Backend**: 
  - Environment file `server/.env` is already configured with Stream credentials
  - `STREAM_API_KEY=vfdtvg3uh9b3`
  - `STREAM_API_SECRET=27sftgh8nb69pkxckazmw8e2k2kwpk5vuesupuana3x2223mevxzpsudkh5wethn`

## Deployment
See `server/README.md` for detailed Render deployment instructions (supports deployment without GitHub using direct upload or Render CLI).

## Key Features
- **Secure Auth**: Password-based login/register via Express Backend.
- **Real-time Chat**: 1-on-1 messaging, threads, reactions.
- **Media Support**: Images, files, emojis.
- **User Search**: Find users by name/ID.
- **Audio/Video Calls**: Integrated calling.
- **Custom Branding**: "Konvos" theme with enhanced color contrast and visual harmony.

## Database Schema
The `server/schema.sql` defines the `users` table:
- `id`: TEXT PRIMARY KEY
- `name`: TEXT NOT NULL
- `password_hash`: TEXT NOT NULL (bcrypt hashed)
- `image`: TEXT
- `created_at`: INTEGER
