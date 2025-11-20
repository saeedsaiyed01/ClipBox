git import cors from 'cors';
import Express from 'express';
import { errorHandler } from './dist/middleware/errorHandler.js';
import processRoutes from './dist/src/api/routes/process.routes.js';


const app = Express();
const PORT = 4000;

// --- Middleware ---
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(Express.json());
app.use(Express.static('public'));

// --- Routes ---
app.use('/api', processRoutes);

// --- Error Handling ---
app.use((err, req, res, next) => {
  errorHandler(err, req, res, next);
});

app.listen(PORT, () => console.log(`Backend API listening on http://localhost:${PORT}`));