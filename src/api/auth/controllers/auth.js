// src/api/auth/controllers/auth.js
const bcrypt = require('bcrypt');

module.exports = {
  async login(ctx) {
    const { user_name, password } = ctx.request.body;

    if (!user_name || !password) {
      return ctx.badRequest('Username and password are required');
    }

    try {
      // Find the user by username
      const user = await strapi.query('api::register.register').findOne({
        where: { user_name },
      });

      if (!user) {
        return ctx.badRequest('Invalid username or password');
      }

      // Check the password
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return ctx.badRequest('Invalid username or password');
      }

      // Return success
      ctx.send({ message: 'Login successful' });
    } catch (err) {
      ctx.throw(500, err);
    }
  },
};
