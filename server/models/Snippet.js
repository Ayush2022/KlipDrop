const mongoose = require("mongoose");

const SnippetSchema = new mongoose.Schema({

    code: String,

    text: String,

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600
    }

});

module.exports = mongoose.model("Snippet", SnippetSchema);