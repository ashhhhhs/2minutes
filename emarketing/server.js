const fastify = require('fastify')({ logger: true });
const dotenv = require('dotenv');
dotenv.config();
//calling models
// const setupLogin = require('./api/signup');
const setupSwagger = require('./config/swagger');
const setupMongoDB = require('./config/mongodb');
const setupMiddleware = require('./middleware/middleware');
const setupRoutes = require('./routes');
require('./models/company');
require('./models/section');
require('./models/template');
require('./models/theme');

const startServer = async () => {
  try {
    
    await setupSwagger(fastify);
    await setupMongoDB();
    // setupLogin(fastify);
    setupMiddleware(fastify);
    setupRoutes(fastify);

    fastify.listen({ port: 4000 }, (err, address) => {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }
      console.log(`Server listening on ${address}`);
      console.log('Swagger docs available at http://localhost:4000/documentation');
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();
