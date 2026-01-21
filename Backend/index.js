import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {sql, poolPromise} from './db.js';
import authRoutes from './Routes/auth.route.js';
import coursesRoutes from './Routes/hod/courses.route.js';
import lecturersRoutes from './Routes/hod/lecturers.route.js';
import departmentRoutes from './Routes/department.route.js';
import studentsRoutes from './Routes/hod/students.route.js';

import sessionSemesterRoutes from './Routes/sessem.route.js';
// lecturersRoutes
import lecturersCourseRoutes from './Routes/lecturer/courses.route.js';
import lecturersResultsRoutes from './Routes/lecturer/results.route.js';
import { syncCourseAssignments } from './Controllers/hod/syncCourseAssignments.js';

const app = express();


app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], // Your frontend URLs
    credentials: true // Allow cookies to be sent
}));
app.use(bodyParser.json());
app.use(cookieParser()); // Add cookie parser middleware

app.use('/api/auth', authRoutes);
app.use('/api/hod/courses', coursesRoutes)
app.use('/api/hod/lecturers', lecturersRoutes)
app.use('/api/hod/students', studentsRoutes)
app.use('/api/departments', departmentRoutes)
app.use(`/api/sessions`, sessionSemesterRoutes)

// lecturersRoutes

app.use('/api/lecturers', lecturersCourseRoutes)
app.use('/api/lecturers/results', lecturersResultsRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    console.error('Error:', message);
    
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
});

const PORT = process.env.PORT || 5000;

// Sync course assignments on startup
(async () => {
    try {
        console.log('Syncing course assignments...');
        await syncCourseAssignments();
        console.log('Course assignments sync completed');
    } catch (error) {
        console.error('Failed to sync course assignments:', error);
    }
})();

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})


