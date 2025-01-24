import express from 'express';
import { getUsers, refreshToken, registerUser, verifyLogin, verifyToken } from '../controllers/userController.js';

const userRoute = express.Router();

userRoute.post('/register',registerUser);
userRoute.post('/login',verifyLogin);
userRoute.post('/verify_token',verifyToken);
userRoute.post('/refresh_token',refreshToken);
userRoute.get('/home',getUsers);

export default userRoute;