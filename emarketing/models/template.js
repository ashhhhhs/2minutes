const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  template_name: {
    type: String,
    required: true,
  },
});

const Template = mongoose.model('Template', templateSchema);
module.exports = Template; 