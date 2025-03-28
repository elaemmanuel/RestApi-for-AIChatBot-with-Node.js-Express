const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

dotenv.config(); // Load environment variables
const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Connect to MongoDB
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

// Start the server
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});