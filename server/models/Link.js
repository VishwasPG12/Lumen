const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true },
    url: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        default: "Untitled",
    },
    summary: {
        type: String,
        default: "",
    },
    tags: {
        type: [String], 
        default: [],
    },
    category: {
        type: String,
        default: "Uncategorized",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Link', LinkSchema);