import Admin from '../models/adminModel.js';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const verifyLogin = async ( req, res ) => {
    try{

        const { email, password } = req.body;

        const admin = await Admin.findOne({email : email});
        if(!admin) return res.status(401).json({ message : 'Incorrect email'});

        const vPassword = await bcrypt.compare(password,admin.password);
        if(!vPassword) return res.status(401).json({ message : 'Incorrect password'});

        const payload = { admin_id : admin._id}
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_ADMIN, { expiresIn : '5m'});
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET_ADMIN, { expiresIn : '7d'});
        res.status(200).json({ accessToken : accessToken, refreshToken : refreshToken })

    }catch(err){
        console.log(err);
    }
}

export const verifyToken = async ( req, res) => {
    try{
        const token = req.headers['authorization']?.split(' ')[1];
        if(!token) return res.sendStatus(401);

        const isVerified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_ADMIN);
        if(!isVerified) return res.sendStatus(401);

        res.sendStatus(200);

    }catch(err){
        console.log(err);
    }
}

export const refreshToken = async(req, res) => {
    try{

        const refreshToken = req.headers['authorization']?.split(' ')[1];
        if(!refreshToken) return res.sendStatus(401);

        const isVerified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_ADMIN);
        if(!isVerified) return res.sendStatus(401);

        const payload = { admin_id : (isVerified).admin_id };
        const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_ADMIN, { expiresIn : '5m'});

        res.json({ accessToken : newAccessToken });

    }catch(err){
        console.log(err);
    }
}

export const getAdmin = async (req, res) => {
    try{

        const accessToken = req.headers['authorization']?.split(' ')[1];
        if(!accessToken) return res.sendStatus(401);

        const isVerified = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_ADMIN);
        if(!isVerified) return res.sendStatus(401);

        let adminId = (isVerified).admin_id;
        const admin = await Admin.findOne({ _id : adminId });

        res.status(200).json({ admin : admin});

    }catch(err){
        console.log(err);
    }
}

export const userCount = async (req,res) => {
    try{
        const count = await User.countDocuments();
        res.json(count);
    }catch(err){
        console.log(err)
    }
}