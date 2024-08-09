const fastifySwagger = require('@fastify/swagger');
const fastifySwaggerUI = require('@fastify/swagger-ui');

const setupSwagger = async (fastify) => {
  await fastify.register(fastifySwagger, {
    routePrefix: '/documentation',
    openapi: {
      info: {
        title: 'Test Swagger',
        description: 'Testing the Fastify Swagger API',
        version: '0.1.0'
      },
      servers: [{ url: 'http://localhost:3000' }],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'apiKey',
            in: 'header'
          }
        }
      }
    },
    hideUntagged: true,
    exposeRoute: true
  });

  await fastify.register(fastifySwaggerUI, {
    routePrefix: '/documentation',
    swagger: {
      info: {
        title: 'Test API',
        description: 'Testing the Fastify Swagger API',
        version: '0.1.0'
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      },
      host: 'localhost:3000',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'apiKey',
          in: 'header'
        }
      }
    },
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest: (request, reply, next) => { next(); },
      preHandler: (request, reply, next) => { next(); }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => swaggerObject,
    transformSpecificationClone: true
  });

  fastify.addHook('onReady', () => {
    console.log(fastify.swagger());
  });
};

module.exports = setupSwagger;