import express from 'express';
import { getCourses, unassignedCourses, getCourseStats } from '../../Controllers/hod/courses.controller.js';
import { VerifyUser } from '../../utils/VerifyUser.js';



const router = express.Router();

router.get('/getcourses/:id', VerifyUser, getCourses )
router.get('/unassignedcourses/:id', VerifyUser, unassignedCourses)
router.get('/stats/:id', VerifyUser, getCourseStats)

export default router;