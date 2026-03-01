const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Serve static files from the React app
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/build')));

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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

const PORT = process.env.PORT || 80;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
