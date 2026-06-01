import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 5000;
const BACKEND = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Proxy simple forwarder for /api/* to real backend
app.use('/api', async (req: Request, res: Response) => {
  try {
    const url = `${BACKEND}${req.originalUrl}`;
    const init: any = { method: req.method, headers: { ...req.headers } };
    // remove host header to avoid conflicts
    delete init.headers.host;

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      init.body = JSON.stringify(req.body);
      init.headers['content-type'] = 'application/json';
    }

    const backendRes = await fetch(url, init as any);
    const text = await backendRes.text();
    res.status(backendRes.status);
    // forward headers
    backendRes.headers.forEach((value, name) => res.setHeader(name, value));
    res.send(text);
  } catch (err: any) {
    res.status(502).json({ success: false, error: 'Bad gateway', details: err.message });
  }
});

// Health check
app.get('/health', (_req, res) => res.json({ status: 'proxy ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}, forwarding to ${BACKEND}`));

export default app;
