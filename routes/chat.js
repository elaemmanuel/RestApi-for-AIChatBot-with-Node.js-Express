// routes/chat.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Chat = require('../models/chat');
const { send_code_to_api } = require('../services/aiApi');

// Chat API
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user;

    // Deduct tokens
    if (user.tokens < 100) {
      return res.status(402).json({ error: 'Insufficient tokens' });
    }
    user.tokens -= 100;
    await user.save();

    // Call your AI API
    const aiResponse = await send_code_to_api(message);

    if (!aiResponse) {
      return res.status(500).json({ error: 'Error from AI Chat API' });
    }

    // Save chat history
    const chat = new Chat({
      user: user._id,
      message,
      response: aiResponse,
    });
    await chat.save();

    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Chat request failed' });
  }
});

// Token Balance API
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    res.status(200).json({ tokens: req.user.tokens });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch token balance' });
  }
});

module.exports = router;