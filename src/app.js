import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import adminRoute from './routes/adminRoute.js';
import userRoute from './routes/userRoute.js';
import courseRoute from './routes/courseRoute.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('ok'))
    .catch((err) => console.log(err.message))

    
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended : true }))

app.use(cors())

app.use('/admin',adminRoute);
app.use('/c',courseRoute);
app.use('/',userRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`);
});