const mongoose = require('mongoose');

const renderTemplate = async (req, reply) => {
  try {
    const slug = req.params.slug;
    const Company = mongoose.model('Company');
    const company = await Company.findOne({ slug });

    if (!company) {
      reply.status(404).send('Not Found');
      return;
    }

    const sectionMap = {
      "header 1": "header/header1.ejs",
      "footer 1": "footer/footer1.ejs",
    };

    company.sections.sort((a, b) => a.order - b.order);
    const data = { ...company.toObject(), url: process.env.BASE_URL + req.url };

    reply.view('layout.ejs', { data, sectionMap });
  } catch (err) {
    console.error(`Error: ${err}`);
    reply.status(500).send('Internal Server Error');
  }
};

module.exports = renderTemplate;