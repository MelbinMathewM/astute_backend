import express from "express";
import { getUniversity, addCourse, getCoursesName, getCourse, getSemester, getSubjects, addNotes, getChapters, getChapterPdf, editCourse, courseCount, getNotes, notesCount, deleteCourse, deleteNotes } from "../controllers/courseController.js";
import upload from '../middleware/multer.js';

const courseRoute = express.Router();

// query routes
courseRoute.get('/ucity',getUniversity);
courseRoute.get('/course/:universityId',getCoursesName);
courseRoute.get('/course/:courseId/semesters',getSemester);
courseRoute.get('/course/:courseId/semesters/:semester/subjects',getSubjects);
courseRoute.get('/course/:courseId/semesters/:semester/subjects/:subject/notes',getNotes);
courseRoute.get('/course/:courseId/semesters/:semester/subjects/:subject/chapters',getChapters);
courseRoute.get('/universities/:universityId/courses/:courseId/semesters/:semester/subjects/:subject/chapters/:chapter',getChapterPdf);


//course routes
courseRoute.post('/course/add',addCourse);
courseRoute.get('/course/:universityId/:courseId',getCourse);
courseRoute.put('/course/:universityId/:courseId',editCourse);
courseRoute.delete('/course/:courseId',deleteCourse);
courseRoute.get('/courses/count',courseCount);

//notes routes
courseRoute.post('/upload_notes',upload.single('pdf'),addNotes);
courseRoute.delete('/universities/:universityId/courses/:courseId/semesters/:semester/subjects/:subject/chapters/:chapter',deleteNotes);
courseRoute.get('/notes/count',notesCount);

export default courseRoute;