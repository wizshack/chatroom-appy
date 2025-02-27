import express from 'express';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const users = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('register user', (username) => {
    console.log(`User ${socket.id} registered as: ${username}`);
    users[socket.id] = username;
    io.emit('user list', Object.values(users));
    io.emit('user count', Object.keys(users).length);
  });

  socket.on('chat message', (msg) => {
    const username = users[socket.id] || 'Anonymous';
    console.log(`Message from ${username}: ${msg}`);
    io.emit('chat message', `${username}: ${msg}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete users[socket.id];
    io.emit('user list', Object.values(users));
    io.emit('user count', Object.keys(users).length);
  });
});

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, 'dist')));

// For any other request, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
