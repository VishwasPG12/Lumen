const express = require('express');
const router = express.Router();
const Link = require('../models/Link'); 
const axios = require('axios');
const auth = require('../middleware/auth'); 
const { encrypt, decrypt, createBlindIndex } = require('../utils/crypto');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// @route   POST /api/links/analyze
router.post('/analyze', auth, async (req, res) => {
    try {
        const { url, context } = req.body;
        const apiKey = process.env.GROQ_API_KEY;

        if (!url) return res.status(400).json({ message: "URL is required" });

        // 1. DUPLICATE CHECK: Using Blind Index
        const hashedUrl = createBlindIndex(url);
        const existing = await Link.findOne({ user: req.user.id, urlHash: hashedUrl });
        if (existing) return res.status(400).json({ message: "Insight already exists in your vault." });

        // 2. AI ANALYSIS
        let userPrompt = `Analyze this URL: ${url}. `;
        if (context) {
            userPrompt += `Additional context: "${context}". Prioritize this for the summary. `;
        }
        userPrompt += `Return ONLY JSON: "title", "summary", "hashtags" (array), "category" (one word).`;
        
        const groqUrl = `https://api.groq.com/openai/v1/chat/completions`;

        let response;
        let retries = 3;
        while (retries > 0) {
            try {
                response = await axios.post(groqUrl, {
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are a helpful assistant that only outputs strictly valid JSON." },
                        { role: "user", content: userPrompt }
                    ],
                    response_format: { type: "json_object" }
                }, {
                    headers: { 
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json' 
                    }
                });
                break; 
            } catch (err) {
                if (err.response?.status === 429 && retries > 1) {
                    await sleep(2000); 
                    retries--;
                } else throw err;
            }
        }

        const aiData = JSON.parse(response.data.choices[0].message.content);
        const finalTitle = aiData.title || "Untitled Insight";
        const rawCategory = aiData.category || "General";
        const rawTags = aiData.hashtags || [];

        // 3. ENCRYPT EVERYTHING AND SAVE
        const newLink = new Link({
            user: req.user.id, 
            url: encrypt(url),               
            urlHash: hashedUrl,              
            title: encrypt(finalTitle),      
            titleHash: createBlindIndex(finalTitle), 
            summary: encrypt(aiData.summary || "No summary."), 
            
            // Ghost Mode: Encrypting Metadata
            category: encrypt(rawCategory),
            categoryHash: createBlindIndex(rawCategory), // For searching/filtering
            tags: rawTags.map(tag => encrypt(tag))       // Each tag is encrypted
        });

        await newLink.save();
        
        // Return plain text to UI so it displays immediately
        const resData = newLink.toObject();
        resData.url = url;
        resData.title = finalTitle;
        resData.summary = aiData.summary;
        resData.category = rawCategory;
        resData.tags = rawTags;
        
        res.status(201).json(resData);
    } catch (error) {
        console.error("Internal Analyze Error:", error);
        res.status(500).json({ message: "Analysis failed" });
    }
});

// @route   GET /api/links
router.get('/', auth, async (req, res) => {
    try {
        const links = await Link.find({ user: req.user.id }).sort({ createdAt: -1 });
        
        // Decrypt all fields including tags and category
        const decryptedLinks = links.map(link => {
            const l = link.toObject();
            try {
                l.url = (l.url && l.url.includes(':')) ? decrypt(l.url) : l.url;
                l.title = (l.title && l.title.includes(':')) ? decrypt(l.title) : l.title;
                l.summary = (l.summary && l.summary.includes(':')) ? decrypt(l.summary) : l.summary;
                
                // Decrypt Category
                l.category = (l.category && l.category.includes(':')) ? decrypt(l.category) : l.category;
                
                // Decrypt Tags Array
                if (Array.isArray(l.tags)) {
                    l.tags = l.tags.map(t => (t && t.includes(':')) ? decrypt(t) : t);
                }
            } catch (decErr) {
                console.error(`Decryption failed for link ${l._id}`);
            }
            return l;
        });
        
        res.json(decryptedLinks);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch vault." });
    }
});

// @route   DELETE /api/links/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const link = await Link.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!link) return res.status(404).json({ message: "Link not found" });
        res.json({ message: "Link removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;