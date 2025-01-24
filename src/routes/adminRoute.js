import express from 'express';
import { getAdmin, refreshToken, userCount, verifyLogin, verifyToken } from '../controllers/adminController.js';

const adminRoute = express.Router();

adminRoute.post('/verify_token',verifyToken);
adminRoute.post('/refresh_token',refreshToken);
adminRoute.post('/login',verifyLogin);
adminRoute.get('/dashboard',getAdmin);
adminRoute.get('/users/count',userCount);

export default adminRoute;