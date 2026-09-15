import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-endpoints',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', async () => {
            try {
              const data = body ? JSON.parse(body) : {};

              if (req.url === '/api/gemini/advisor') {
                const { askGeminiAdvisor } = await import('./src/server/geminiService');
                const result = await askGeminiAdvisor(data.query, data.snapshot);
                res.writeHead(200);
                res.end(JSON.stringify(result));
                return;
              }

              if (req.url === '/api/gemini/recommendation') {
                const { generateAIRecommendationFromGemini } = await import('./src/server/geminiService');
                const result = await generateAIRecommendationFromGemini(data.buildings);
                res.writeHead(200);
                res.end(JSON.stringify(result));
                return;
              }

              res.writeHead(404);
              res.end(JSON.stringify({ error: 'Endpoint not found' }));
            } catch (err: any) {
              console.error('API Error:', err);
              res.writeHead(500);
              res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
            }
          });
        } else if (req.url === '/api/health') {
          res.writeHead(200);
          res.end(JSON.stringify({ status: 'ok', service: 'EcoCampus AI' }));
        } else {
          res.writeHead(405);
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
