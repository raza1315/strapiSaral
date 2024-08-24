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

    io.on('connection', (socket) => {
      console.log('A user connected');

      socket.on('message', (data) => {
        console.log('Received message:', data.message," by ",data.name, " in room ",data.roomCode);
        io.emit('frontendmessage', data); // Emit to all clients
      });

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  },
};
