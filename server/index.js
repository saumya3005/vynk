require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const projectRoutes = require('./routes/projects');
const noteRoutes = require('./routes/notes');
const communityRoutes = require('./routes/communities');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  }
});

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

const storyRoutes = require('./routes/stories');
const reelRoutes = require('./routes/reels');

app.use('/api/stories', storyRoutes);
app.use('/api/reels', reelRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: "Vynk API is running" });
});

// Socket.io integration
const onlineUsers = new Map(); // Map<userId, Set<socketId>>

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    if (!userId) return;
    socket.userId = userId;
    socket.join(userId);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast online status
    io.emit('userOnline', userId);
    socket.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('sendMessage', (data) => {
    if (data.receiverId) {
      io.to(data.receiverId).emit('receiveMessage', data);
    }
  });

  socket.on('typing', ({ userId, receiverId }) => {
    if (receiverId) io.to(receiverId).emit('typing', { userId });
  });

  socket.on('stopTyping', ({ userId, receiverId }) => {
    if (receiverId) io.to(receiverId).emit('stopTyping', { userId });
  });

  socket.on('deleteMessage', ({ messageId, receiverId }) => {
    if (receiverId) io.to(receiverId).emit('messageDeleted', { messageId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const userId = socket.userId;
    if (userId && onlineUsers.has(userId)) {
      onlineUsers.get(userId).delete(socket.id);
      if (onlineUsers.get(userId).size === 0) {
        onlineUsers.delete(userId);
        io.emit('userOffline', userId);
      }
    }
  });
});

const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vynk')
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
