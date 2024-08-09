//initializing
const fastifyCors = require('@fastify/cors');
const fastifyJwt = require('@fastify/jwt');
const fastifyView = require('@fastify/view');
const fastifyMultipart = require('@fastify/multipart');
const path = require('path');
const ejs = require('ejs');

//setting up middleware & authentication
const setupMiddleware = (fastify) => {
  fastify.register(fastifyCors, { origin: '*' });
  fastify.register(fastifyJwt, { secret: process.env.JWT_SECRET });
  fastify.register(fastifyView, { engine: { ejs } });
  fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, '../../assets'),
    prefix: '/assets/',
  });
  fastify.register(fastifyMultipart);
};

module.exports = setupMiddleware;

