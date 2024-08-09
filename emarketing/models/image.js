const mongoose = require("mongoose");
const imageSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
    },
    contentType: {
        type: String,
        required: true,
    },
    data: {
        type :String,
        required: true, 
    },

});
const image = mongoose.model('Image', ImageSchema);
module.exports = image;