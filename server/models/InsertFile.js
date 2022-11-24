const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    fileCollection: {
        type: Array
    }
})

// name of collection to be created/ inserted into
const File = mongoose.model('fileUploads', fileSchema);
module.exports = File;

