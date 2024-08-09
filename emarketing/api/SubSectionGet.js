const SubSectionGet = async(fastify) => {
    fastify.get(
        "/templates/SubSection",
        {
        preValidation: [fastify.authenticate],
        schema: {
            description: "to create custom fields",
            tags: ["SubSection"],
            consumes: ['multipart/form-data'],
            
            response: {
            200: {
                type: "object",
                properties: {
                message: { type: "string" },
                template: { type: "object" },
                },
            },
            },
        },
        },
        async (req, reply) => {
        const Template = mongoose.model("Template");
        const template = await Template.create(req.body);
        reply.send({ message: "Template created", template });
        }
    );
   

};
module.exports = SubSectionGet