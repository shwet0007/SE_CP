import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

export default app;
