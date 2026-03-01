# 🏗️ Code Collab — Architecture Documentation

A deep-dive into the system design, components, data flow, and deployment pipeline of **Code Collab**, a real-time collaborative code editor.

---

## 📐 High-Level Architecture

```
 ┌─────────────────────────────────────────────────────────────────┐
 │                        Client Browser                           │
 │                                                                 │
 │   ┌──────────────────────────────────────────────────────────┐  │
 │   │               React Frontend (Port 80)                   │  │
 │   │                                                          │  │
 │   │   ┌───────────────┐       ┌──────────────────────────┐  │  │
 │   │   │   App.js      │       │   Socket.io Client       │  │  │
 │   │   │  (UI + State) │◄─────►│   (socket.io-client)     │  │  │
 │   │   └───────────────┘       └──────────┬───────────────┘  │  │
 │   └──────────────────────────────────────┼───────────────────┘  │
 └──────────────────────────────────────────┼──────────────────────┘
                                            │  WebSocket (ws://)
                                            │
 ┌──────────────────────────────────────────┼──────────────────────┐
 │                     Docker Network (code-collab-net)            │
 │                                          │                      │
 │   ┌──────────────────────────────────────▼───────────────────┐  │
 │   │            Node.js Backend (Port 5000)                   │  │
 │   │                                                          │  │
 │   │   ┌───────────────┐       ┌──────────────────────────┐  │  │
 │   │   │  Express.js   │       │   Socket.io Server       │  │  │
 │   │   │  REST API     │       │   (Room Management)      │  │  │
 │   │   │  /health      │       │   In-memory room store   │  │  │
 │   │   └───────────────┘       └──────────────────────────┘  │  │
 │   └──────────────────────────────────────────────────────────┘  │
 └─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Breakdown

### 1. Frontend — React Application

| Property       | Details                                  |
|----------------|------------------------------------------|
| Framework      | React 18                                 |
| Port           | 80 (served via Nginx in production)      |
| Key Libraries  | `socket.io-client`, `react-scripts`      |
| Entry Point    | `frontend/src/App.js`                    |
| Styling        | `frontend/src/App.css` (plain CSS)       |

**Key Responsibilities:**
- Renders the collaborative code textarea editor.
- Maintains connection state (`Connected` / `Disconnected` status badge).
- Provides an **Invite** button that copies the session URL to clipboard.
- Emits `code-change` events on every keystroke and listens for `code-update` events from other users.
- On mount, joins the `default-room` via a `join-room` socket event and receives a `code-sync` payload to hydrate initial state.

**State / Data Flow:**
```
User types in textarea
       │
       ▼
handleCodeChange()
       │
       ├──► setCode(newCode)          [local React state update]
       │
       └──► socket.emit('code-change', { roomId, code })
                        │
                        ▼  [via WebSocket]
               Backend Server
                        │
                        └──► socket.to(roomId).emit('code-update', code)
                                        │
                                        ▼ [received by all other clients]
                              setCode(newCode) on peer browsers
```

---

### 2. Backend — Node.js Server

| Property       | Details                                  |
|----------------|------------------------------------------|
| Runtime        | Node.js                                  |
| Framework      | Express.js 4.x                           |
| Real-time      | Socket.io 4.x                            |
| Port           | 5000                                     |
| Entry Point    | `backend/server.js`                      |

**Key Responsibilities:**
- Creates an HTTP server with an Express app and attaches a Socket.io instance.
- Manages collaborative **rooms** stored in an in-memory object (`const rooms = {}`).
- Handles three socket events:
  - `join-room` — joins a socket to a named room and syncs current code state.
  - `code-change` — updates the in-memory room state and broadcasts to all peers.
  - `disconnect` — logs user disconnection.
- Exposes REST endpoints: `GET /` (info) and `GET /health` (liveness probe).

**Socket Events Reference:**

| Event (Client → Server) | Payload                      | Description                             |
|--------------------------|------------------------------|-----------------------------------------|
| `join-room`              | `roomId: string`             | Join a collaboration room               |
| `code-change`            | `{ roomId, code }`           | Broadcast a code update to peers        |

| Event (Server → Client) | Payload        | Description                             |
|--------------------------|----------------|-----------------------------------------|
| `code-sync`              | `code: string` | Full code state sent on room join       |
| `code-update`            | `code: string` | Incremental code update from a peer     |

---

### 3. Nginx — Reverse Proxy (Production)

| Property       | Details                                  |
|----------------|------------------------------------------|
| Config file    | `frontend/nginx.conf`                    |
| Role           | Serves the React static build & proxies  |

In production, the React app is built into static files and served by **Nginx** on port 80. Nginx proxies `/socket.io` requests to the backend container, enabling WebSocket upgrades through the same port.

```
Browser ──► Nginx (Port 80)
               ├── /         ──► serve React static build (index.html, JS, CSS)
               └── /socket.io/  ──► proxy_pass to backend:5000
```

---

## 🐳 Docker & Containerization

The project uses **Docker Compose** to orchestrate two services on a shared bridge network.

```yaml
# docker-compose.yml (simplified)
services:
  backend:   # Node.js server on port 5000
  frontend:  # Nginx + React build on port 80
             # depends_on: backend
networks:
  code-collab-net:  # bridge network connecting containers
```

**Docker Build Strategy:**

| Service   | Dockerfile Location     | Strategy                                      |
|-----------|-------------------------|-----------------------------------------------|
| Backend   | `backend/Dockerfile`    | Single-stage: copies `server.js`, runs `npm ci` |
| Frontend  | `frontend/Dockerfile`   | Multi-stage: Stage 1 builds React → Stage 2 copies build into Nginx image |

**Container Communication:**

Containers communicate over the `code-collab-net` Docker bridge network. The frontend container uses the `BACKEND_HOST=backend` environment variable to resolve the backend service by its Docker DNS name.

---

## 🔄 CI/CD Pipeline — Jenkins

The `Jenkinsfile` defines a **4-stage pipeline**:

```
┌──────────┐    ┌───────────┐    ┌─────────────────────┐    ┌──────────────────┐
│  Clone   │───►│   Build   │───►│ Docker Build & Push  │───►│  AWS EC2 Deploy  │
│          │    │           │    │                      │    │                  │
│ checkout │    │ npm ci    │    │ docker build         │    │ SSH → EC2        │
│   scm    │    │ npm build │    │ docker push          │    │ docker pull      │
│          │    │ (frontend)│    │ (DockerHub)          │    │ docker run       │
└──────────┘    └───────────┘    └─────────────────────┘    └──────────────────┘
```

| Stage                | Action                                                                 |
|----------------------|------------------------------------------------------------------------|
| **Clone**            | Checks out source code from SCM                                        |
| **Build**            | Installs deps (`npm ci`) for backend; installs & builds frontend       |
| **Docker Build & Push** | Builds Docker image, authenticates with DockerHub, pushes image    |
| **AWS EC2 Deploy**   | SSH into EC2 instance, pulls latest image, restarts the container      |

**Required Jenkins Credentials:**

| Credential ID      | Type                  | Used For                        |
|--------------------|-----------------------|---------------------------------|
| `dockerhub`        | Username/Password     | DockerHub login                 |
| `aws-ec2`          | SSH private key       | EC2 SSH access                  |
| `ec2-host`         | Secret text           | EC2 hostname/IP                 |

---

## 📁 Project Directory Structure

```
occ_2/
├── backend/
│   ├── server.js             # Express + Socket.io server
│   ├── package.json          # Backend dependencies
│   ├── Dockerfile            # Backend container image
│   └── .dockerignore
│
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   └── App.css           # Application styles
│   ├── public/
│   │   └── index.html        # HTML entry point
│   ├── nginx.conf            # Nginx reverse proxy config
│   ├── docker-entrypoint.sh  # Container startup script
│   ├── package.json          # Frontend dependencies
│   ├── Dockerfile            # Multi-stage frontend container image
│   └── .dockerignore
│
├── docker-compose.yml        # Orchestrates frontend + backend containers
├── Dockerfile                # Root-level Dockerfile (for full-stack image)
├── Jenkinsfile               # 4-stage CI/CD pipeline definition
├── README.md                 # General project documentation
├── ARCHITECTURE.md           # This file
└── architecture-diagram.txt  # ASCII architecture overview
```

---

## 🔑 Key Design Decisions

| Decision                   | Rationale                                                                                      |
|----------------------------|-----------------------------------------------------------------------------------------------|
| **In-memory room store**   | Simple and fast; no database required for a prototype. Not persistent across server restarts. |
| **Socket.io rooms**        | Native room abstraction makes broadcasting to specific groups of users simple.                |
| **React with plain CSS**   | Lightweight, no CSS framework dependencies; keeps bundle size minimal.                        |
| **Multi-stage Docker build** | Keeps the final frontend image small by discarding build tools after compiling React.       |
| **Nginx reverse proxy**    | Allows frontend and socket connections to share port 80, simplifying firewall rules.         |
| **Jenkins CI/CD**          | Automates the full build → containerize → deploy lifecycle on every commit.                  |

---

## 🌐 Network Ports Summary

| Service         | Internal Port | External Port | Protocol        |
|-----------------|---------------|---------------|-----------------|
| React (Nginx)   | 80            | 80            | HTTP            |
| Node.js Backend | 5000          | 5000          | HTTP/WebSocket  |

---

*Last updated: March 2026*
