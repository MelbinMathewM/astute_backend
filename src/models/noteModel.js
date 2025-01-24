import mongoose from "mongoose";


const noteSchema = new mongoose.Schema({
    university_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        required: true
    },
    course_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Course',
        required : true
    },
    semester : {
        type : String,
        required : true
    },
    subject : {
        type : String,
        required : true
    },
    chapter : {
        type : String,
        required : true
    },
    pdf_url : {
        type : String,
        required : true
    }
},{ timestamps : true });

const Notes = mongoose.model('Notes',noteSchema);

export default Notes;