const fileUpload = async (fastify) => {
    fastify.post(
      "/company/uploadfile",
      {
        preValidation: [fastify.authenticate],
        schema: {
          description: "Upload company data",
          tags: ["company"],
          response: {
            200: {
              type: "array",
              items: { type: "object" },
            },
          },
        },
      },
      async (req, reply) => {
        try {
          const data = await req.file();
          const buffer = await data.toBuffer();
          const workbook = xlsx.read(buffer, { type: "buffer" });
          const sheetName = workbook.SheetNames[0];
          const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
          reply.send(sheetData);
        } catch (error) {
          reply.code(500).send({ error: "File processing failed" });
        }
      }
    );
  };
  
  module.exports = fileUpload;
  
  