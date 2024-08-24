'use strict';

module.exports = {
  register({ strapi }) {},

  bootstrap() {
    const io = require('socket.io')(strapi.server.httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    const rooms = {}; // Object to keep track of users in each room
    const userSocketMap = {}; // Map to track socket IDs by user names

    io.on('connection', (socket) => {
      console.log('A user connected');

      // Handle joining a room
      socket.on('joinRoom', (roomCode, userName) => {
        socket.join(roomCode);

        // Initialize room if not exists
        if (!rooms[roomCode]) {
          rooms[roomCode] = [];
        }

        // Add user to the room
        if (!rooms[roomCode].includes(userName)) {
          rooms[roomCode].push(userName);
        }

        // Map the user to this socket ID
        userSocketMap[socket.id] = { userName, roomCode };

        // Notify all clients in the room about the new user
        io.to(roomCode).emit('updateUsers', rooms[roomCode]);

        console.log(`User ${userName} joined room: ${roomCode}`);
      });

      // Handle message
      socket.on('message', (data) => {
        console.log('Received message:', data.message, " by ", data.name, " in room ", data.roomCode);
        io.to(data.roomCode).emit('frontendmessage', data); // Emit to all clients in the room
      });

      // Handle leaving a room
      socket.on('leaveRoom', (roomCode, userName) => {
        console.log(`User ${userName} requested to leave room: ${roomCode}`);

        // Get the user details from the userSocketMap
        const userInfo = userSocketMap[socket.id];
        if (userInfo && userInfo.roomCode === roomCode) {
          // Remove user from rooms
          if (rooms[roomCode]) {
            const index = rooms[roomCode].indexOf(userName);
            if (index !== -1) {
              rooms[roomCode].splice(index, 1);

              // Notify remaining clients in the room
              io.to(roomCode).emit('updateUsers', rooms[roomCode]);
              console.log(`User ${userName} left room: ${roomCode}`);
            }
          }

          // Clean up the userSocketMap
          delete userSocketMap[socket.id];
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected');

        // Get the user details from the userSocketMap
        const userInfo = userSocketMap[socket.id];
        if (userInfo) {
          const { userName, roomCode } = userInfo;

          // Remove user from rooms
          if (rooms[roomCode]) {
            const index = rooms[roomCode].indexOf(userName);
            if (index !== -1) {
              rooms[roomCode].splice(index, 1);

              // Notify remaining clients in the room
              io.to(roomCode).emit('updateUsers', rooms[roomCode]);
            }
          }

          // Clean up the userSocketMap
          delete userSocketMap[socket.id];
        }
      });
    });
  },
};
