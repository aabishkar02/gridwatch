import express from 'express';
import { userAuth } from '../middleware/userAuth.js'; 
import { getData } from '../controllers/dataController.js';


const dataRouter = express.Router();
dataRouter.get('/', userAuth, getData);


export default dataRouter;
