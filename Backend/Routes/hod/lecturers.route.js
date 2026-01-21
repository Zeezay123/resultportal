import express from 'express';
import { getLecturers, assignCourse, unassignCourse } from '../../Controllers/hod/lecturers.controller.js';
import { VerifyUser } from '../../utils/VerifyUser.js';

const router = express.Router();

router.get('/getlecturers', VerifyUser, getLecturers);
router.post('/assigncourse', VerifyUser, assignCourse);
router.post('/unassigncourse/:id', VerifyUser, unassignCourse);

export default router;
