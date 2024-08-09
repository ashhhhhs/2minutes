//schema 
const mongoose = require('mongoose');
const Section = require('./section');
const Theme= require('./theme');
const companySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    theme: {type: mongoose.Schema.Types.ObjectId, ref:'Theme'},
    sections: [{type: mongoose.Schema.Types.ObjectId, ref: 'Section'}],
  });
  //creating model of company

  const Company = mongoose.model('Company', companySchema);
  module.exports = Company;


