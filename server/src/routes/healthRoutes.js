import { Router } from 'express';
import { checkDbConnection } from '../config/db.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json({ status: 'ok', service: 'fitsme-server', timestamp: new Date().toISOString() });
});

router.get('/db', async (req, res) => {
  try {
    const result = await checkDbConnection();
    res.json({ status: 'ok', dbTime: result.now });
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'Database unreachable.' });
  }
});

export default router;
