import { Router } from 'express';
import { apiKeyAuth } from '../middleware/userAuth.js';
import { data } from '../controllers/apiController.js';

const apiRouter = Router();

apiRouter.get('/data', apiKeyAuth, data);

export default apiRouter;
