const loginapi = async(fastify) => {
    
  fastify.post(
    '/company/login', {
        
    schema: {
      description: 'Login to the system',
      tags: ['user'],
      summary: 'Logs in a user',
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string'}
        }
      },
      response: {
        200: {
          description: 'Successful login',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' }
          }
        },
        400: {
          description: 'Invalid credentials',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { username, password } = request.body;
    const User = mongoose.model("User");
    const user = await User.findOne({ username });
  
    if (!user) {
      return reply.status(400).send({ success: false, message: 'User not found' });
    }
  
    const match = await bcrypt.compare(password, user.password);
  
    if (!match) {
      return reply.status(400).send({ success: false, message: 'Invalid credentials' });
    }
  
    const token = jwt.sign({ id: user._id, username: user.username }, secret, {
      expiresIn: '1h',
    });
  
    reply.send({ success: true, token });
  });
  
  
};
module.exports = loginapi;