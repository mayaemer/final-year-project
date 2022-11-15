const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    fileName: {
        type: String
    }
})

// name of collection to be created/ inserted into
const File = mongoose.model('filess', fileSchema);
module.exports = File;