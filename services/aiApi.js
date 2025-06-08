
const Groq = require('groq-sdk');
require('dotenv').config();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function send_code_to_api(userQuery) {
  try {
    const params = {
      messages: [
        { role: 'system', content: 'You are a helpful assistant that can answer users\' queries concisely.' },
        { role: 'user', content: userQuery },
      ],
      model: 'llama-3.3-70b-versatile', 
    };

    const chatCompletion = await client.chat.completions.create(params);
    const aiResponse = chatCompletion.choices[0].message.content; 
    return aiResponse;

  } catch (error) {
    console.error('Error during Groq API call:', error);
    return null;
  }
}

module.exports = { send_code_to_api };
