const mongoose = require('mongoose');
const Template = require('./template');
const SubSectionSchema = new mongoose.Schema({
    template: {
      type: mongoose.Schema.Types.ObjectId, ref: 'template',
      required: true
    },
    data: {
      type: Map,
      of: mongoose.Schema.Types.Mixed //for different maps
    },
    comments: {
        type: String,
        required: true,
    },
    image: {
        type:String,
        required:null,
    },
      type: Number,
      required: true
    
  });
  
  //same here as well
  const SectionSub = mongoose.model('Section1', SubSectionSchema);
  module.exports = SectionSub; 