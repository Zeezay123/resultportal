import express from 'express';
import multer from 'multer';
import { downloadResultTemplate, uploadResults } from '../../Controllers/lecturer/results.controller.js';
import { VerifyUser } from '../../utils/VerifyUser.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv' // .csv
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only .xlsx, .xls, and .csv files are allowed.'));
        }
    }
});

router.get('/download-template', VerifyUser, downloadResultTemplate);
router.post('/upload', VerifyUser, upload.single('file'), uploadResults);

export default router;
