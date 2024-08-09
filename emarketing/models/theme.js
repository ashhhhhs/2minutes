const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  colors: {
    type: Map,
    of: String,
  },
  fonts: {
    type: Map,
    of: String,
  },
});
//direct export of schema as making model wasnt working
const Theme = mongoose.model('Theme', themeSchema);
module.exports = Theme;