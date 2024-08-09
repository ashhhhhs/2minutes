const uploadtemplate = async(fastify) => {
    fastify.put(
        '/template/upload',
        {
          preValidation: [fastify.authenticate],
          schema: {
            description: 'Upload a template file',
            tags: ['template'],
            consumes: ['multipart/form-data'],
            body: {
              type: 'object',
              properties: {
                file: { type: 'string', format: 'binary' },
              },
            },
            response: {
              200: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  template: { type: 'object' },
                },
              },
            },
          },
        },
        async (req, reply) => {
          try {
            const data = await req.file(); 
            const template = new Template({
              name: data.filename,
              content: data.file.toString(), 
            });
            await template.save();
            reply.send({ message: 'Template uploaded and saved', template });
          } catch (error) {
            reply.status(500).send({ error: 'Error uploading template' });
          }
        }
      );
    
};

module.exports = uploadtemplate;