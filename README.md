# Code Collab

A real-time collaborative code editor built with React, Node.js, Express, and Socket.io.

> 📐 For a detailed technical breakdown, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Architecture

```
code-collab/
├── frontend/           # React application
│   ├── src/           # React source files
│   ├── public/        # Static assets
│   ├── Dockerfile     # Multi-stage build (nginx)
│   └── nginx.conf     # Nginx configuration
├── backend/           # Node.js Express server
│   ├── server.js      # Express + Socket.io server
│   ├── Dockerfile     # Node.js production build
│   └── package.json   # Backend dependencies
├── docker-compose.yml # Local development setup
├── Jenkinsfile        # CI/CD pipeline (4 stages)
├── README.md
└── .gitignore
```

## User Stories

1. **As a user**, I want to join a collaborative editing room so that I can collaborate with others on the same document.

2. **As a user**, I want to type code in a textarea editor and see my changes in real-time so that I can write code collaboratively.

3. **As a user**, I want to see other users' code changes instantly so that I can work together in real-time.

4. **As a user**, I want to know my connection status so that I am aware if I am connected or disconnected.

5. **As a user**, I want to invite others to my session by copying a shareable link so that collaboration is easy to start.

6. **As a user**, I want multiple users to edit the same room so that team collaboration is possible.

7. **As a developer**, I want a Dockerized application so that it can be easily deployed to any environment.

## Technology Stack

- **Frontend**: React 18, Socket.io Client
- **Backend**: Node.js 18, Express, Socket.io
- **Container**: Docker, Docker Compose
- **CI/CD**: Jenkins

## Setup Instructions

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Jenkins (for CI/CD)

### Local Development

```bash
# Clone the repository
git clone <repo-url>
cd code-collab

# Start with Docker Compose
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:5000

### Manual Setup

```bash
# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm start
```

## Docker Run

To run the application directly with Docker:

```bash
# Build and run backend
docker build -t code-collab-backend ./backend
docker run -d -p 5000:5000 --name backend code-collab-backend

# Build and run frontend
docker build -t code-collab-frontend ./frontend
docker run -d -p 80:80 --link backend code-collab-frontend
```

## Jenkins Pipeline

The Jenkinsfile includes 4 stages:

1. **Clone** - Checkout the source code from repository
2. **Build** - Install dependencies and build frontend
3. **Docker Build & Push** - Build Docker image and push to DockerHub
4. **AWS EC2 Deploy** - SSH into EC2, pull image, and deploy

### Jenkins Credentials Required

- `dockerhub` - DockerHub credentials
- `aws-ec2` - AWS EC2 SSH key credentials
- `ec2-host` - EC2 instance hostname/IP

### Jenkins Setup

1. Install Jenkins and configure Docker
2. Add credentials in Jenkins:
   - DockerHub credentials (ID: `dockerhub`)
   - AWS EC2 SSH key (ID: `aws-ec2`)
   - EC2 host string (ID: `ec2-host`)
3. Create a new Pipeline job
4. Point to the Jenkinsfile in the repository

## AWS EC2 Deployment

The EC2 instance should have:
- Docker installed
- Port 80 open in security group
- SSH access configured

### Manual EC2 Deployment

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@<ec2-ip>

# Pull and run
docker pull code-collab/code-collab:latest
docker run -d -p 80:80 --name code-collab code-collab/code-collab:latest
```

## Production Build

```bash
# Build Docker image
docker build -t code-collab/code-collab:latest .

# Push to DockerHub
docker login
docker push code-collab/code-collab:latest


