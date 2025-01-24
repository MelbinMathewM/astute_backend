import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    ucity_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'University',
        required : true
    },
    course : {
        type : String,
        required : true
    },
    semesters : [{
        semester : {
            type : String,
            required : true
        },
        subjects : {
            type : [String],
            required : true
        }
    }]
})

const Course = mongoose.model('Course', courseSchema);

export default Course;