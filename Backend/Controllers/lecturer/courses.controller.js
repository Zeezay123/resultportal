import {sql, poolPromise} from '../../db.js';
import { errorHandler } from '../../utils/error.js';


export const getCourses = async (req, res, next) => {
   
    const lectid = req.params.lectid;

    try {
        
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        const result = await pool.request()
            .input('StaffCode', sql.VarChar, lectid)
            .query(`
                SELECT 
                    s.StaffID,
                    s.StaffCode,
                    c.CourseID,
                    c.CourseCode,
                    c.CourseName,
                    c.CreditUnits,
                    c.CourseType,
                    c.LevelID,
                    ca.AssignmentID,
                    ca.AssignedDate,
                    ca.AssignmentStatus,
                    ses.SessionName,
                    sem.SemesterName,
                    d.DepartmentName
                FROM dbo.staff s
                INNER JOIN dbo.course_assignment ca ON s.StaffID = ca.LecturerID
                INNER JOIN dbo.course c ON ca.CourseID = c.CourseID
                LEFT JOIN dbo.sessions ses ON ca.SessionID = ses.SessionID
                LEFT JOIN dbo.semesters sem ON ca.SemesterID = sem.SemesterID
                LEFT JOIN dbo.appdepartment d ON c.DepartmentID = d.DepartmentID
                WHERE s.StaffCode = @StaffCode
                    AND ca.AssignmentStatus = 'assigned'
                ORDER BY c.CourseCode
            `);

        res.status(200).json({
            success: true,
            count: result.recordset.length,
            courses: result.recordset
        });

    } catch (error) {
        console.error('Error fetching lecturer courses:', error);
        return next(errorHandler(500, "Error fetching courses: " + error.message));
    }
}