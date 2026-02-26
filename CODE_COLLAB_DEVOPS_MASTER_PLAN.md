You are a Senior DevOps Architect.

Build a complete production-ready DevOps project named "Code Collab" that STRICTLY follows PSG DevOps assignment guidelines.

DO NOT overengineer.
DO NOT add unnecessary tools.
DO NOT change architecture.
DO NOT mix CI systems.
Use Jenkins only.
Keep it clean, layered, and academic-ready.

========================================
PROJECT REQUIREMENTS (MANDATORY)
========================================

The application must:

1. Be a real-time collaborative code editor
2. Use:
   - Frontend: React
   - Backend: Node.js + Express
   - WebSockets: Socket.io
   - Optional Redis support (Docker service only)
3. Be fully Dockerized
4. Be deployable using:
   docker run command successfully
5. Use Jenkinsfile with minimum 4 stages:
   - Clone
   - Build
   - Docker Build & Push
   - AWS EC2 Deploy (via SSH)

========================================
PSG GUIDELINES – MUST SATISFY ALL
========================================

1. Break application scope into 5+ user stories (include in README.md)
2. Single GitHub repo with layered structure
3. Proper README.md with:
   - Architecture
   - User stories
   - Setup steps
   - Jenkins explanation
4. Proper commit-ready structure
5. Include .gitignore (Node + Docker)
6. Code promotion must assume PR-based workflow
7. Include Jenkinsfile with minimum 4 stages
8. Jenkinsfile must include:
   - Clone stage
   - Build stage
   - Docker build stage
9. Include Dockerfile (production-ready, multi-stage)
10. Docker image must be pushable to DockerHub
11. docker run must successfully start the full app

========================================
PROJECT STRUCTURE (STRICT)
========================================

code-collab/
 ├── frontend/
 │    ├── src/
 │    ├── public/
 │    ├── package.json
 │    ├── Dockerfile
 │    └── .dockerignore
 │
 ├── backend/
 │    ├── server.js
 │    ├── package.json
 │    ├── Dockerfile
 │    └── .dockerignore
 │
 ├── docker-compose.yml
 ├── Dockerfile (optional unified)
 ├── Jenkinsfile
 ├── README.md
 ├── .gitignore
 └── architecture-diagram.txt

========================================
BACKEND REQUIREMENTS
========================================

- Express server on port 5000
- Socket.io room-based collaboration
- Allow join-room
- Allow code-change
- Broadcast updates to room
- CORS enabled
- Clean structure
- No unnecessary dependencies

========================================
FRONTEND REQUIREMENTS
========================================

- React app
- Simple textarea editor
- Connect to backend via Socket.io
- Join default room
- Sync text in real-time
- Clean minimal UI
- No heavy UI libraries

========================================
DOCKER REQUIREMENTS
========================================

- Backend Dockerfile using node:18-alpine
- Frontend Dockerfile multi-stage (build → nginx)
- Expose correct ports
- Production optimized builds
- .dockerignore included
- docker-compose for local dev
- Final docker run must work independently

========================================
JENKINSFILE REQUIREMENTS
========================================

Pipeline must contain:

Stage 1: Clone
Stage 2: Build
   - npm install backend
   - yarn install + build frontend
Stage 3: Docker Build & Push
   - docker login using credentials
   - build tagged image
   - push to DockerHub
Stage 4: AWS EC2 Deploy
   - SSH into EC2
   - docker pull image
   - stop old container
   - run new container

Include:
- environment block
- credentials usage
- post cleanup (docker system prune)

========================================
SECURITY + CLEAN CODE RULES
========================================

- No hardcoded credentials
- Use environment variables
- Use production installs (npm ci)
- Use minimal base images
- Clean indentation
- No commented junk
- No console debugging leftover

========================================
OUTPUT FORMAT
========================================

Generate:

1. Full folder tree
2. All file contents clearly separated
3. Final docker run command
4. Final Jenkins setup instructions
5. EC2 deployment instructions
6. No explanations outside project files

Do not skip any file.
Do not simplify Jenkins.
Do not remove AWS stage.
Do not add GitHub Actions.
Do not add Kubernetes.

Build this as if it will be evaluated by a strict DevOps professor.

Generate now.