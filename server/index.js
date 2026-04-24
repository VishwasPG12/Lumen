const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose'); // 1. Import Mongoose
const linkRoutes = require('./routes/linkRoutes');
const authRoutes = require('./routes/authRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 2. Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

app.use('/api/links', linkRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});