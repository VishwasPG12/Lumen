const express = require('express');
const router = express.Router();
const Link = require('../models/Link'); 
const axios = require('axios');
const auth = require('../middleware/auth'); 

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// @route   POST /api/links/analyze
// @desc    Analyze URL and save to DB (LINKED TO USER)
router.post('/analyze', auth, async (req, res) => {
    try {
        const { url } = req.body;
        const apiKey = process.env.GROQ_API_KEY;

        if (!url) return res.status(400).json({ message: "URL is required" });

        const prompt = `Analyze this URL: ${url}. 
        Return a JSON object with exactly these keys:
        "title": "a catchy title",
        "summary": "a 2-sentence summary",
        "hashtags": ["tag1", "tag2", "tag3"],
        "category": "one-word category"`;

        const groqUrl = `https://api.groq.com/openai/v1/chat/completions`;
        
        let response;
        let retries = 3;
        while (retries > 0) {
            try {
                response = await axios.post(groqUrl, {
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are a helpful assistant that only outputs JSON." },
                        { role: "user", content: prompt }
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
                    await sleep(1500);
                    retries--;
                } else throw err;
            }
        }

        const aiData = JSON.parse(response.data.choices[0].message.content);

        const newLink = new Link({
            user: req.user.id, 
            url,
            title: aiData.title || aiData.hashtags[0],
            summary: aiData.summary,
            tags: aiData.hashtags || aiData.tags,
            category: aiData.category
        });

        await newLink.save();
        res.status(201).json(newLink);
    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ message: "Analysis failed", details: error.message });
    }
});

// @route   GET /api/links
// @desc    Get ONLY the links belonging to the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        // Filter by user ID
        const links = await Link.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(links);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/links/:id
// @desc    Delete a link (Ownership check)
router.delete('/:id', auth, async (req, res) => {
    try {
        const link = await Link.findById(req.params.id);
        
        if (!link) return res.status(404).json({ message: "Link not found" });

        if (link.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized to delete this" });
        }

        await link.deleteOne();
        res.json({ message: "Link removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;