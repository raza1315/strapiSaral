// src/api/auth/routes/routes.js
module.exports = {
    routes: [
      {
        method: 'POST',
        path: '/login',
        handler: 'auth.login',
        config: {
          policies: [],
        },
      },
    ],
  };
  