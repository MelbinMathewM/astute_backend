import mongoose from "mongoose";

const ucitySchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    location : {
        type : String,
        required : true
    }
});

const UCity = mongoose.model('University', ucitySchema);

export default UCity;