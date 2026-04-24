const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // --- All Content Encrypted ---
    url: { type: String, required: true },
    title: { type: String, default: "Untitled" },
    summary: { type: String, default: "" },
    
    // NEW: Category and Tags are now Encrypted Strings
    category: { type: String, default: "" }, 
    tags: { type: [String], default: [] }, // Array of encrypted strings

    // --- Blind Indexes (Hashed for searching/filtering) ---
    // These allow the DB to find "Tech" or "Adult" links 
    // without the DB actually knowing what the words are.
    urlHash: { type: String, index: true }, 
    titleHash: { type: String, index: true },
    categoryHash: { type: String, index: true }, // For fast filtering

    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Link', LinkSchema);