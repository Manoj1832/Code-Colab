# Code Collab — Application Workflow

This document describes the end-to-end workflow of the **Code Collab** real-time collaborative code editor, covering the user flow, real-time communication, and the CI/CD deployment pipeline.

---

## 1. High-Level Architecture

```
┌──────────────────┐        WebSocket (Socket.io)        ┌──────────────────┐
│                  │ ◄─────────────────────────────────►  │                  │
│  React Frontend  │                                      │  Node.js Backend │
│   (Port 80)      │  ── HTTP (via Nginx reverse proxy) ──│   (Port 5000)    │
│                  │                                      │                  │
└──────────────────┘                                      └──────────────────┘
        ▲                                                          │
        │                                                          │
   User Browser                                         In-memory Room Store
```

- **Frontend** — React 18 SPA served by Nginx.
- **Backend** — Express + Socket.io server managing rooms and broadcasting code changes.
- **Communication** — All real-time data flows over **Socket.io** (WebSocket with HTTP long-polling fallback).

---

## 2. User Workflow (Step-by-Step)

### 2.1 Opening the App

1. User navigates to the app URL in their browser.
2. The React app (`App.js`) loads and immediately creates a Socket.io client connection to the backend.

### 2.2 Joining a Room

3. On mount, the frontend emits a **`join-room`** event with a `roomId` (currently defaults to `"default-room"`).
4. The backend receives the event, adds the socket to the room, and:
   - Creates the room in its in-memory store if it doesn't exist.
   - Sends back a **`code-sync`** event containing the current code for that room, so the new user sees the latest state.

### 2.3 Editing Code

5. The user types in the `<textarea>` code editor.
6. On every keystroke, the frontend:
   - Updates local React state (`code`).
   - Sets a short **typing guard** (100 ms) to prevent incoming updates from overwriting active typing.
   - Emits a **`code-change`** event to the backend with `{ roomId, code }`.

### 2.4 Real-Time Sync

7. The backend receives the `code-change` event and:
   - Stores the updated code in the in-memory room object.
   - Broadcasts a **`code-update`** event to **all other sockets** in the same room.
8. Each receiving client updates its editor with the new code (unless the user is actively typing).

### 2.5 Inviting Collaborators

9. The user clicks the **"Invite"** button.
10. The current page URL is copied to the clipboard so it can be shared with collaborators.

### 2.6 Connection Status

11. The frontend listens for Socket.io's built-in `connect` event and displays a **Connected / Disconnected** indicator in the header.

---

## 3. Socket.io Event Reference

| Event | Direction | Payload | Purpose |
|---|---|---|---|
| `join-room` | Client → Server | `roomId` (string) | Join a collaborative editing room |
| `code-sync` | Server → Client | `code` (string) | Send the latest room code to a newly joined user |
| `code-change` | Client → Server | `{ roomId, code }` | Notify the server of a code edit |
| `code-update` | Server → Client | `code` (string) | Broadcast code changes to other room members |

---

## 4. DevOps & Deployment Workflow

### 4.1 Local Development

```bash
# Run backend (terminal 1)
cd backend && npm install && npm start    # Starts on port 5000

# Run frontend (terminal 2)
cd frontend && npm install && npm start   # Starts on port 3000 (React dev server)
```

### 4.2 Docker Compose (Local)

```bash
docker-compose up --build
```

This spins up two containers on a shared Docker bridge network:

| Service | Port | Details |
|---|---|---|
| `backend` | 5000 | Express + Socket.io server |
| `frontend` | 80 | Nginx serving React build, proxying `/socket.io` to backend |

### 4.3 CI/CD Pipeline (Jenkins)

The Jenkinsfile defines a **4-stage** pipeline:

```
Clone  →  Build  →  Docker Build & Push  →  AWS EC2 Deploy
```

| Stage | What Happens |
|---|---|
| **Clone** | Checks out source code from GitHub |
| **Build** | Runs `npm ci` for backend & frontend, then `npm run build` for the React app |
| **Docker Build & Push** | Builds a Docker image and pushes it to DockerHub |
| **AWS EC2 Deploy** | SSHs into EC2, pulls the latest image, stops the old container, and starts a new one on port 80 |

### 4.4 Production Deployment (AWS EC2)

```
GitHub Push  →  Jenkins detects change  →  Build & Dockerize  →  Push to DockerHub  →  Deploy to EC2
```

The EC2 instance requirements:
- Docker installed
- Port 80 open in the security group
- SSH access configured for Jenkins

---

## 5. Data Flow Diagram

```
User A (Browser)                    Server                     User B (Browser)
      │                               │                              │
      │──── join-room ────────────►   │                              │
      │◄─── code-sync ───────────────│                              │
      │                               │                              │
      │                               │   ◄──── join-room ──────────│
      │                               │──────── code-sync ─────────►│
      │                               │                              │
      │──── code-change ─────────►   │                              │
      │                               │──────── code-update ───────►│
      │                               │                              │
      │                               │   ◄──── code-change ────────│
      │◄─── code-update ────────────│                              │
      │                               │                              │
```

---

## 6. Key Files

| File | Purpose |
|---|---|
| `frontend/src/App.js` | Main React component — editor UI, socket events, invite functionality |
| `frontend/src/App.css` | Styling for the editor and header |
| `backend/server.js` | Express server with Socket.io — room management and code broadcasting |
| `docker-compose.yml` | Multi-container local setup (frontend + backend) |
| `frontend/nginx.conf` | Nginx config — serves React build and reverse-proxies Socket.io |
| `Jenkinsfile` | CI/CD pipeline definition (4 stages) |
| `frontend/Dockerfile` | Multi-stage Docker build for the React app (build → Nginx) |
| `backend/Dockerfile` | Docker build for the Node.js backend |
