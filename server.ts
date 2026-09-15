import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { askGeminiAdvisor, generateAIRecommendationFromGemini } from './src/server/geminiService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API endpoints
app.post('/api/gemini/advisor', async (req, res) => {
  try {
    const { query, snapshot } = req.body;
    const result = await askGeminiAdvisor(query, snapshot);
    res.json(result);
  } catch (error: any) {
    console.error('Gemini Advisor Error:', error);
    res.status(500).json({ error: error.message || 'Error processing inquiry' });
  }
});

app.post('/api/gemini/recommendation', async (req, res) => {
  try {
    const { buildings } = req.body;
    const result = await generateAIRecommendationFromGemini(buildings);
    res.json(result);
  } catch (error: any) {
    console.error('Gemini Recommendation Error:', error);
    res.status(500).json({ error: error.message || 'Error generating recommendation' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', system: 'EcoCampus AI' });
});

// Serve static assets in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`EcoCampus AI Server running on port ${PORT}`);
});
