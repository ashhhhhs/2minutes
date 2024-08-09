const createTemplate = async(fastify) => {
    fastify.post(
        "/company/create-template",
        {
        preValidation: [fastify.authenticate],
        schema: {
            description: "Create a template from uploaded data",
            tags: ["template"],
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
module.exports = createTemplate;