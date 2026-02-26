const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);

    if (!rooms[roomId]) {
      rooms[roomId] = { code: '' };
    }

    socket.emit('code-sync', rooms[roomId].code);
  });

  socket.on('code-change', ({ roomId, code }) => {
    if (rooms[roomId]) {
      rooms[roomId].code = code;
    }
    socket.to(roomId).emit('code-update', code);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Code Collab Backend',
    endpoints: {
      health: '/health',
      socket: 'Socket.io at /socket.io'
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
