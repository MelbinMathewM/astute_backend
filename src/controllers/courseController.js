import UCity from '../models/universityModel.js';
import Course from '../models/courseModel.js';
import Notes from '../models/noteModel.js';
import cloudinary from '../middleware/cloudinary.js';
import mongoose from 'mongoose';

export const getUniversity = async (req,res) => {
    try{
        const universities = await UCity.find();
        res.status(200).json(universities);
    }catch(err){
        console.log(err)
    }
}

export const getCoursesName = async (req, res) => {
    try {
        const { universityId } = req.params;

        const course = await Course.aggregate([
            {
                $match: { ucity_id: new mongoose.Types.ObjectId(universityId) }
            },
            {
                $project: {
                    course: 1
                }
            }
        ]);

        res.json(course);
    } catch (err) {
        console.error("Error fetching courses:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getSemester = async (req, res) => {
    try{
        const { courseId } = req.params;

        const semesters = await Course.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(courseId) }
            },
            {
                $unwind: '$semesters'
            },
            {
                $group: { _id: null, semesters: { $addToSet: '$semesters.semester' } }
            },
            {
                $project: { _id: 0, semesters: 1 }
            }
        ]);

        const formattedSemesters = semesters.length > 0
        ? semesters[0].semesters.map((sem) => ({ semester: sem }))
        : [];
        res.json(formattedSemesters.sort((a,b) => a.semester - b.semester));

    }catch(err){
        console.log(err)
    }
};

export const getSubjects = async (req, res) => {
    try{
        const { courseId, semester } = req.params;

        const course = await Course.findOne(
            { _id : courseId },
            { semesters : 1 }
        )

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const semesterData = course.semesters.find((sem) => sem.semester === semester);

        if (!semesterData) {
            return res.status(404).json({ message: 'Semester not found' });
        }

        const subjects = semesterData.subjects;
        
        res.json(subjects);
    }catch(err){
        console.log(err)
    }
}

export const getNotes = async (req,res) => {
    try{
        const { courseId, semester, subject } = req.params;

        const notes = await Notes.aggregate([
            {
                $match: { 
                    course_id: new mongoose.Types.ObjectId(courseId),
                    semester: semester,
                    subject: subject
                }
            }
        ]);

        if (notes.length === 0) {
            return res.status(404).json({ message: 'No chapters found' });
        }

        res.json(notes);
    }catch (err) {
        console.log(err);
    }
}

export const getChapters = async (req, res) => {
    try {
        const { courseId, semester, subject } = req.params;

        const chapters = await Notes.aggregate([
            {
                $match: { 
                    course_id: new mongoose.Types.ObjectId(courseId),
                    semester: parseInt(semester),
                    subject: subject
                }
            },
            {
                $group: { 
                    _id: '$chapter'
                }
            },
            {
                $project: { 
                    _id: 0, 
                    chapter: '$_id'
                }
            }
        ]);

        if (chapters.length === 0) {
            return res.status(404).json({ message: 'No chapters found' });
        }

        const chapterList = chapters.map(chap => chap.chapter);
        res.json(chapterList);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching chapters' });
    }
};

export const getChapterPdf = async (req, res) => {
    try {
        
        const { universityId, courseId, semester, subject, chapter } = req.params;

        const note = await Notes.findOne({
            university_id: universityId,
            course_id: courseId,
            semester: semester,
            subject: subject,
            chapter: chapter,
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.json({ pdf_url: note.pdf_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const addCourse = async (req, res) => {
    try{
        const { ucity_id, course, semesters } = req.body;

        const courses = new Course({
            ucity_id,
            course,
            semesters
        });
        await courses.save();

        res.status(201).json({ message : 'Course added successfully' });
    }catch(err){
        console.log(err);
    }
}


export const getCourse = async (req, res) => {
    try {
        const { courseId, universityId } = req.params;

        const course = await Course.aggregate([
            {
                $match: { 
                    _id: new mongoose.Types.ObjectId(courseId),
                    ucity_id: new mongoose.Types.ObjectId(universityId)
                }
            },
            {
                $project: {
                    course: 1,
                    semesters: 1
                }
            }
        ]);

        if (!course || course.length === 0) {
            return res.status(404).json({ message: "Course not found" });
        }

        const result = course.map((courseData) => ({
            course: courseData.course,
            semesters: courseData.semesters
        }));

        res.json(result);

    } catch (error) {
        console.error("Error fetching course details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const editCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const updatedCourse = await Course.findByIdAndUpdate(courseId, req.body);

        if (!updatedCourse) {
            return res.status(404).json({ message: 'Error updating course' });
        }

        res.status(200).json({ message: 'Course updated successfully', updatedCourse });
    } catch (err) {
        console.error('Error editing course:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        const notes = await Notes.find({ course_id: courseId });
        
        for (const note of notes) {
            const publicId = note.pdf_url.split('/upload/')[1].replace(/^v\d+\//, '');

            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        }
        
        await Notes.deleteMany({ course_id: courseId });

        await Course.findByIdAndDelete(courseId);

        return res.json({ success: true, message: "Course and associated notes deleted." });

    } catch (error) {
        console.error("Error deleting course:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
}

export const courseCount = async (req,res) => {
    try{
        const count = await Course.countDocuments();
        res.json(count);
    }catch(err){
        console.log(err)
    }
}


export const addNotes = async (req, res) => {
    try{

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder : 'notes',
            resource_type : 'raw'
        });

        const { university_id, course_id, semester, subject, chapter } = req.body;

        const notes = new Notes({
            university_id,
            course_id,
            semester,
            subject,
            chapter,
            pdf_url : result.secure_url
        })

        await notes.save();

        res.status(201).json({message : 'Notes uploaded successfully', note : notes})
    }catch(err){
        console.log(err);
    }
}

export const deleteNotes = async (req,res) => {

    const { courseId, semester, subject, chapter } = req.params;

    try{
        const note = await Notes.findOne({ course_id: courseId, semester, subject, chapter });
        if(note){
            const publicId = note.pdf_url.split('/upload/')[1].replace(/^v\d+\//, '');
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        }

        await Notes.deleteOne({ course_id: courseId });

        return res.json({ success: true, message: "Notes deleted." });
    }catch(err){
        console.log(err)
    }
}

export const notesCount = async (req,res) => {
    try{
        const count = await Notes.countDocuments();
        res.json(count);
    }catch(err){
        console.log(err)
    }
}