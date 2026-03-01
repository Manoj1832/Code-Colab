# User Stories — Code Collab

This document breaks down the application scope into user stories following the standard format:
**As a [role], I want [feature], so that [benefit].**

---

## Epic 1: Real-Time Collaborative Editing

| ID | User Story | Priority | Status |
|----|-----------|----------|--------|
| US-01 | As a user, I want to join a collaborative editing room so that I can collaborate with others on the same document. | High | Done |
| US-02 | As a user, I want to type code in a textarea editor and see my changes in real-time so that I can write code collaboratively. | High | Done |
| US-03 | As a user, I want to see other users' code changes instantly so that I can work together in real-time. | High | Done |

## Epic 2: User Experience & Session Management

| ID | User Story | Priority | Status |
|----|-----------|----------|--------|
| US-04 | As a user, I want to know my connection status so that I am aware if I am connected or disconnected. | Medium | Done |
| US-05 | As a user, I want to invite others to my session by copying a shareable link so that collaboration is easy to start. | Medium | Done |
| US-06 | As a user, I want multiple users to edit the same room so that team collaboration is possible. | High | Done |

## Epic 3: DevOps & Deployment

| ID | User Story | Priority | Status |
|----|-----------|----------|--------|
| US-07 | As a developer, I want a Dockerized application so that it can be easily deployed to any environment. | High | Done |
| US-08 | As a developer, I want a CI/CD pipeline (Jenkins) so that code changes are automatically built, tested, and deployed. | High | Done |
| US-09 | As a developer, I want Docker images pushed to DockerHub so that the application can be pulled and run anywhere. | High | Done |
| US-10 | As a developer, I want the application deployable to an AWS EC2 instance so that it is accessible over the internet. | Medium | Done |

---

## Acceptance Criteria

### US-01: Join a collaborative room
- User connects to the app and is automatically placed in a default room.
- The server tracks users per room in memory.

### US-02: Real-time code editing
- A textarea is rendered for code input.
- Every keystroke emits a `code-change` event via WebSocket.

### US-03: See other users' changes
- Incoming `code-update` events update the textarea content in real-time.
- Changes from all peers are reflected without page reload.

### US-04: Connection status indicator
- A status badge shows "Connected" (green) or "Disconnected" (red).
- Status updates automatically on socket connect/disconnect events.

### US-05: Invite via shareable link
- An "Invite" button copies the current session URL to the clipboard.
- Other users opening the link join the same room.

### US-06: Multi-user room editing
- Multiple users can join the same room simultaneously.
- All participants see each other's changes in real-time.

### US-07: Dockerized application
- Dockerfiles exist for both frontend and backend.
- `docker-compose up` starts the full application stack.

### US-08: CI/CD pipeline
- Jenkinsfile defines stages: Clone, Build, Docker Build & Push, Deploy.
- Pipeline triggers on code push to the repository.

### US-09: DockerHub image publishing
- Docker image is built and pushed to a public DockerHub repository.
- `docker pull` and `docker run` successfully runs the application.

### US-10: AWS EC2 deployment
- Pipeline SSHs into EC2 and pulls the latest Docker image.
- Application is accessible via the EC2 public IP on port 80.
