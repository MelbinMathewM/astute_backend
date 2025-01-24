import multer from 'multer';

const storage = multer.diskStorage({});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null,true)
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
}

const upload = multer({ storage, fileFilter });

export default upload;