import express from 'express';
import { getCourses, unassignedCourses, getCourseStats, getCourseDepartments } from '../../Controllers/hod/courses.controller.js';
import { VerifyUser } from '../../utils/VerifyUser.js';
import { downloadAssignedCourses } from '../../Controllers/hod/download.controller.js';
import multer from 'multer';





const router = express.Router();




router.get('/getcourses/:id', VerifyUser, getCourses )
router.get('/unassignedcourses', VerifyUser, unassignedCourses)
router.get('/stats/:id', VerifyUser, getCourseStats)
router.get('/coursedepartment/:id', VerifyUser, getCourseDepartments)


router.get('/download-assignedcourses/:id', VerifyUser, downloadAssignedCourses )

export default router;