import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const verifyToken = async ( req ,res) => {
    try{

        const accessToken = req.headers['authorization']?.split(' ')[1];
        if(!accessToken) return res.sendStatus(401);

        const isVerified = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_USER);
        if(!isVerified) return res.sendStatus(401);

        res.sendStatus(200);

    }catch(err){
        console.log(err);
    }
}

export const refreshToken = async ( req, res ) => {
    try{

        const refreshToken = req.headers['authorization']?.split(' ')[1];
        if(!refreshToken) return res.sendStatus(401);

        const isVerified = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET_USER);
        if(!isVerified) return res.sendStatus(401);

        const payload = { user_id : (isVerified).user_id };
        const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_USER, { expiresIn : '30s' });

        res.json({ newAccessToken });

    }catch(err){
        console.log(err);
    }
}

export const registerUser = async ( req, res)  => {
    try{

        const { name, email, phone, password } = req.body;

        const existingEmail = await User.findOne({ email });
        if(existingEmail) return res.status(401).json({ message : 'Email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const user = new User({
            name,
            email,
            phone,
            password : hashedPassword,
        });
        await user.save();
        res.status(201).json({ message : ' Account created successfully' });

    }catch(err){
        console.log(err);
    }
}

export const verifyLogin = async ( req, res ) => {
    try{

        const { email, password } = req.body;

        const user = await User.findOne({email : email});
        if(!user) return res.status(401).json({ message : 'Incorrect email' });

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(401).json({ message : 'Incorrect password' });
        
        const payload = { user_id : user._id };
        const accessToken = jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET_USER, { expiresIn : '30s' });
        const refreshToken = jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET_USER, { expiresIn : '7d' });

        res.status(200).json({ accessToken, refreshToken });

    }catch(err){
        console.log(err);
    }
}

export const getUsers = async ( req, res ) => {
    try{
        const accessToken = req.headers['authorization']?.split(' ')[1];
        if(!accessToken) return res.sendStatus(401);

        const isVerified = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_USER);
        if(!isVerified) return res.sendStatus(401);
        const userId = (isVerified).user_id;
        const user = await User.findOne({ _id : userId });
        if(!user) return res.sendStatus(404);

        res.status(200).json({ user });

    }catch(err){
        console.log(err);
    }
}