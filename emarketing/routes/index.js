const renderTemplate = require("../controllers/renderTemplate");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uploadtemplate = require("../api/templateUpload");
const createTemplate = require("../api/templateCreate");
const fileUpload = require("../api/fileUpload");
// const imageApi = require("../imageUpload");
const SubSection = require("../api/SubSection");
const SubSectionGet = require("../api/SubSectionGet");
const login = require("../api/login");
const fastify = require("fastify")();

// Routes setting
const setupRoutes = (fastify) => {
  fastify.decorate("authenticate", async function (req, reply) {
    try {
      await req.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  fastify.post("/sign-in", (req, reply) => {
    const token = fastify.jwt.sign({ user: "user", password: "password" });
    reply.send({ token });
  });

  fastify.get(
    "/ping",
    {
      schema: {
        description: "Ping route to check the server status",
        tags: ["utility"],
        response: {
          200: {
            type: "string",
            example: "pong 🏓",
          },
        },
      },
    },
    async (req, reply) => {
      reply.send("pong 🏓");
    }
  );

  fastify.get(
    "/",
    {
      schema: {
        description: "Get all companies",
        tags: ["company"],
        querystring: {
          name: { type: "string" },
          address: { type: "string" },
        },
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                address: { type: "string" },
                phone: { type: "string" },
                logo: { type: "string" },
                slug: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const { name, address } = req.query;
        const filter = {};
        if (name) filter.name = new RegExp(name, "i");
        if (address) filter.address = new RegExp(address, "i");

        const Company = mongoose.model("Company");
        const data = await Company.find(filter).populate("theme").populate("sections").exec();

        reply.status(200).send(data);
      } catch (err) {
        reply.status(500).send(err);
      }
    }
  );

  fastify.get(
    "/:slug/*",
    {
      schema: {
        description: "Render template based on slug",
        tags: ["template"],
        params: {
          slug: { type: "string" },
        },
        response: {
          200: {
            type: "string",
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const slug = await mongoose.model("Company").findOne({ slug: req.params.slug }).populate('theme').populate({ path: 'sections', populate: 'template' }).exec();
        if (!slug) {
          reply.status(404).send("Not Found");
          return;
        }
        await renderTemplate(req, reply);
      } catch (err) {
        reply.status(500).send(err);
      }
    }
  );

  fastify.get(
    "/templates",
    {
      schema: {
        description: "Get all templates",
        tags: ["template"],
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                template_name: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const Template = mongoose.model("Template");
        const templates = await Template.find();
        reply.send(templates);
      } catch (err) {
        reply.status(500).send(err);
      }
    }
  );

  fastify.post(
    "/company",
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: "Create a new company",
        tags: ["company"],
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            address: { type: "string" },
            phone: { type: "string" },
            logo: { type: "string" },
            slug: { type: "string" },
            theme: { type: "object" },
            sections: { type: "array" },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              name: { type: "string" },
              address: { type: "string" },
              phone: { type: "string" },
              logo: { type: "string" },
              slug: { type: "string" },
            },
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const Theme = mongoose.model("Theme");
        const Section = mongoose.model("Section");
        const newTheme = new Theme(req.body.theme);
        const savedTheme = await newTheme.save();
        const sectionPromises = req.body.sections.map(async (e) => {
          const tempSection = new Section(e);
          return await tempSection.save();
        });
        const savedSections = await Promise.all(sectionPromises);

        const Company = mongoose.model("Company");
        const company = new Company({
          ...req.body,
          theme: savedTheme._id,
          sections: savedSections.map((section) => section._id),
        });
        await company.save();
        reply.status(201).send(company);
      } catch (err) {
        reply.status(500).send(err);
      }
    }
  );

  fastify.get(
    "/company/:id",
    {
      schema: {
        description: "Get a company by ID",
        tags: ["company"],
        params: {
          id: { type: "string" },
        },
        response: {
          200: {
            type: "object",
            properties: {
              _id: { type: "string" },
              name: { type: "string" },
              address: { type: "string" },
              phone: { type: "string" },
              logo: { type: "string" },
              slug: { type: "string" },
              theme: { type: "object" },
              sections: { type: "array" },
            },
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const Company = mongoose.model("Company");
        const company = await Company.findById(req.params.id).populate('theme').populate({ path: 'sections', populate: "template" }).exec();

        if (!company) {
          reply.status(404).send("Not Found");
          return;
        }
        reply.send(company);
      } catch (err) {
        reply.status(500).send(err);
      }
    }
  );

  fastify.get(
    "/company/:id/sections",
    {
      schema: {
        description: "Get sections of a company by company ID",
        tags: ["company"],
        params: {
          id: { type: "string" },
        },
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
            },
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const Company = mongoose.model("Company");
        const company = await Company.findById(req.params.id);
        if (!company) {
          reply.status(404).send("Not Found");
          return;
        }
        reply.send(company.sections);
      } catch (err) {
        reply.status(500).send(err);
      }
    }
  );
//subsection api
fastify.register(SubSection);
fastify.register(SubSectionGet);
// Image Upload Api
// fastify.register(imageApi);

//file upload api

fastify.register(fileUpload);

//creating template api
  
  fastify.register(createTemplate);
 
//template upload api

  fastify.register(uploadtemplate);

//login api

  fastify.register(login);
  
//UPDATE
  fastify.put(
    "/company/:id",
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: "Update a company by ID",
        tags: ["company"],
        params: {
          id: { type: "string" },
        },
        body: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            address: { type: "string" },
            phone: { type: "string" },
            logo: { type: "string" },
            slug: { type: "string" },
            theme: { type: "object" },
            sections: { type: "array" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              _id: { type: "string" },
              name: { type: "string" },
              address: { type: "string" },
              phone: { type: "string" },
              logo: { type: "string" },
              slug: { type: "string" },
            },
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const Company = mongoose.model("Company");
        const company = await Company.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true }
        ).populate('theme').populate({ path: 'sections', populate: "template" }).exec();

        if (!company) {
          reply.status(404).send("Not Found");
          return;
        }
        reply.send(company);
      } catch (err) {
        reply.status(500).send(err);
      }
    }
  );

  fastify.put(
    "/company/:id/sections",
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: "Add a section to a company by ID",
        tags: ["company"],
        params: {
          id: { type: "string" },
        },
        body: {
          type: "object",
          properties: {
            template: { type: "object" },
            data: { type: "object" },
            order: { type: "number" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              name: { type: "string" },
              address: { type: "string" },
              phone: { type: "string" },
              logo: { type: "string" },
              slug: { type: "string" },
            },
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const Company = mongoose.model("Company");
        const company = await Company.findById(req.params.id);
        if (!company) {
          reply.status(404).send("Not Found");
          return;
        }
        const Section = mongoose.model("Section");
        const section = new Section(req.body);
        company.sections.push(section);
        await company.save();
        reply.send(company);
      } catch (err) {
        reply.status(500).send(err);
      }
    }
  );


  fastify.delete(
    "/company/:id",

    {
      preValidation: [fastify.authenticate],
      schema: {
        description: "Delete a company by ID",
        tags: ["company"],
        params: {
          id: { type: "string" },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const Company = mongoose.model("Company");
        const company = await Company.findByIdAndDelete(req.params.id);

        if (!company) {
          reply.status(404).send("Not Found");
          return;
        }
        reply.send({ message: "Company deleted" });
      } catch (err) {
        reply.status(500).send(err);
      }
    }
  );

  fastify.get(
    "/render/:id",
    {
      schema: {
        description: "Render company by slug",
        tags: ["template"],
        params: {
          id: { type: "string" },
        },
        response: {
          200: {
            type: "string",
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const Company = mongoose.model("Company");
        const company = await Company.findOne({ slug: req.params.id }).populate('theme').populate({ path: 'sections', populate: "template" }).lean().exec();
        const data = {
          sections: company.sections.map((e) => ({
            ...e,
            temp_location: e.template.category + "/" + e.template.template_name,
          })),
          company,
        };
        return reply.view("views/render.ejs", data);
      } catch (err) {
        reply.status(500).send(err);
      }
    }
  );
};

module.exports = setupRoutes;
