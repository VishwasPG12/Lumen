const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Get the header
    const authHeader = req.header('Authorization');

    // 2. Check if it exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    // 3. Extract the raw token (everything after "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (err) {
        // If the token is expired or tampered with, this will trigger
        res.status(401).json({ message: "Token is not valid" });
    }
};