import {sql, poolPromise} from '../../db.js'
import { errorHandler } from '../../utils/error.js'


// Get all lecturers in HOD's department
export const getLecturers = async (req, res, next) => {
    const hodDepartmentID = req.user?.departmentID; // HOD's department ID from auth
    const search = req.query.search || '';
    const orderBy = req.query.orderBy || ''; // asc or desc for units

    console.log('HOD Department ID:', hodDepartmentID);
    console.log('User object:', req.user);

    try {
        const pool = await poolPromise;
        
        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

        let query = `
            SELECT 
                s.StaffID as LecturerID,
                s.LastName,
                s.OtherNames,
                s.Email,
                s.DepartmentID,
                d.DepartmentName,
                COALESCE(SUM(c.CreditUnits), 0) AS TotalUnitsAssigned,
                COUNT(ca.AssignmentID) AS TotalCoursesAssigned,
                STRING_AGG(c.CourseCode, ', ') AS AssignedCourses
            FROM dbo.staff s
            LEFT JOIN dbo.appdepartment d ON s.DepartmentID = d.DepartmentID
            LEFT JOIN dbo.course_assignment ca ON s.StaffID = ca.LecturerID
            LEFT JOIN dbo.course c ON ca.CourseID = c.CourseID
        `;

        const params = [];
        let paramIndex = 1;
        
        // Only filter by department if hodDepartmentID is provided
        if (hodDepartmentID) {
            query += ` WHERE s.DepartmentID = @departmentID`;
        } else {
            query += ` WHERE 1=1`; // Get all lecturers if no department filter
        }

        // Search filter
        if (search) {
            query += ` AND (s.LastName LIKE @search OR s.OtherNames LIKE @search OR s.Email LIKE @search)`;
        }

        query += ` GROUP BY s.StaffID, s.LastName, s.OtherNames, s.Email, s.DepartmentID, d.DepartmentName`;

        // Order by units
        if (orderBy === 'asc') {
            query += ` ORDER BY TotalUnitsAssigned ASC`;
        } else if (orderBy === 'desc') {
            query += ` ORDER BY TotalUnitsAssigned DESC`;
        } else {
            query += ` ORDER BY s.LastName ASC`;
        }

        const request = pool.request();
        if (hodDepartmentID) {
            request.input('departmentID', sql.Int, hodDepartmentID);
        }
        if (search) {
            request.input('search', sql.VarChar, `%${search}%`);
        }

        console.log('Executing query:', query);
        const result = await request.query(query);
        
        console.log('Found lecturers:', result.recordset.length);

        res.status(200).json({
            success: true,
            count: result.recordset.length,
            lecturers: result.recordset
        });

    } catch (error) {
        console.error('Error in getLecturers:', error);
        return next(errorHandler(500, "Server Error: " + error.message))
    }
}


// Assign course to lecturer
export const assignCourse = async (req, res, next) => {
    const { courseID, lecturerID, programmeID } = req.body;

    const semesterID = parseInt(req.body.semesterID) 
    const sessionID = parseInt(req.body.sessionID) 

    const hodDepartmentID = req.user?.departmentID;
    
    console.log('Assign Course Request Body:', req.user, req.body);
    
    // Validate required fields
    if (!courseID || !lecturerID) {
        return next(errorHandler(400, "CourseID and LecturerID are required"));
    }

    try {
        const pool = await poolPromise;
        
        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

        // Validate SessionID exists if provided
        if (sessionID) {
            const sessionCheck = await pool.request()
                .input('sessionID', sql.Int, sessionID)
                .query('SELECT SessionID FROM dbo.sessions WHERE SessionID = @sessionID');
            
            if (sessionCheck.recordset.length === 0) {
                return next(errorHandler(400, `Invalid SessionID: ${sessionID}. Session does not exist in database.`));
            }
        }

        // Validate SemesterID exists if provided
        if (semesterID) {
            const semesterCheck = await pool.request()
                .input('semesterID', sql.Int, semesterID)
                .query('SELECT SemesterID FROM dbo.semesters WHERE SemesterID = @semesterID');
            
            if (semesterCheck.recordset.length === 0) {
                return next(errorHandler(400, `Invalid SemesterID: ${semesterID}. Semester does not exist in database.`));
            }
        }

        // Validate that the course belongs to HOD's department
        const courseCheck = await pool.request()
            .input('courseID', sql.Int, courseID)
            .input('departmentID', sql.Int, hodDepartmentID)
            .query(`
                SELECT CourseID FROM dbo.course 
                WHERE CourseID = @courseID 
                AND (CourseCategory = 'general' 
                    OR FacultyID IN (SELECT FacultyID FROM dbo.appdepartment WHERE DepartmentID = @departmentID)
                    OR DepartmentID = @departmentID)
            `);

        if (courseCheck.recordset.length === 0) {
            return next(errorHandler(403, "You don't have permission to assign this course"));
        }

        // Check if course is already assigned
        const existingAssignment = await pool.request()
            .input('courseID', sql.Int, courseID)
            .input('semesterID', sql.Int, semesterID)
            .input('sessionID', sql.Int, sessionID)
            .query(`
                SELECT AssignmentID FROM dbo.course_assignment 
                WHERE CourseID = @courseID 
                AND SemesterID = @semesterID 
                AND SessionID = @sessionID
                AND LecturerID IS NOT NULL
            `);

        if (existingAssignment.recordset.length > 0) {
            return next(errorHandler(400, "Course is already assigned for this semester/session"));
        }

        // Insert or update assignment (SessionID and SemesterID optional if not selected)
        const assignQuery = `
            IF EXISTS (SELECT 1 FROM dbo.course_assignment 
                      WHERE CourseID = @courseID 
                      ${sessionID ? 'AND SessionID = @sessionID' : ''}
                      ${semesterID ? 'AND SemesterID = @semesterID' : ''}
                      AND LecturerID IS NOT NULL)
            BEGIN
                UPDATE dbo.course_assignment 
                SET LecturerID = @lecturerID,
                    AssignedDate = GETDATE(),
                    AssignmentStatus = 'assigned'
                WHERE CourseID = @courseID 
                ${sessionID ? 'AND SessionID = @sessionID' : ''}
                ${semesterID ? 'AND SemesterID = @semesterID' : ''}
            END
            ELSE
            BEGIN
                INSERT INTO dbo.course_assignment 
                (CourseID, LecturerID, ${sessionID ? 'SessionID,' : ''} ${semesterID ? 'SemesterID,' : ''} ${programmeID ? 'ProgrammeID,' : ''} AssignedDate, AssignmentStatus)
                VALUES (@courseID, @lecturerID, ${sessionID ? '@sessionID,' : ''} ${semesterID ? '@semesterID,' : ''} ${programmeID ? '@programmeID,' : ''} GETDATE(), 'assigned')
            END
        `;

        const request = pool.request()
            .input('courseID', sql.Int, courseID)
            .input('lecturerID', sql.Int, lecturerID);
        
        if (sessionID) request.input('sessionID', sql.Int, sessionID);
        if (semesterID) request.input('semesterID', sql.Int, semesterID);
        if (programmeID) request.input('programmeID', sql.Int, programmeID);

        await request.query(assignQuery);

        res.status(200).json({
            success: true,
            message: "Course assigned successfully"
        });

    } catch (error) {
        return next(errorHandler(500, "Server Error: " + error.message))
    }
}


// Unassign course from lecturer
export const unassignCourse = async (req, res, next) => {
    const { assignmentID, lecturerID, courseCode } = req.body;
    const hodDepartmentID = req.user?.departmentID;

    console.log('Unassign Request:', req.body);

    try {
        const pool = await poolPromise;
        
        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

        let actualAssignmentID = assignmentID;

        // If assignmentID not provided, find it using lecturerID and courseCode
        if (!actualAssignmentID && lecturerID && courseCode) {
            const findAssignment = await pool.request()
                .input('lecturerID', sql.Int, lecturerID)
                .input('courseCode', sql.VarChar, courseCode)
                .query(`
                    SELECT ca.AssignmentID 
                    FROM dbo.course_assignment ca
                    JOIN dbo.course c ON ca.CourseID = c.CourseID
                    WHERE ca.LecturerID = @lecturerID
                    AND c.CourseCode = @courseCode
                `);

            if (findAssignment.recordset.length === 0) {
                return next(errorHandler(404, "Assignment not found for this lecturer and course"));
            }

            actualAssignmentID = findAssignment.recordset[0].AssignmentID;
            console.log('Found AssignmentID:', actualAssignmentID);
        }

        if (!actualAssignmentID) {
            return next(errorHandler(400, "AssignmentID or (LecturerID + CourseCode) required"));
        }

        // Verify HOD has permission to unassign this course
        const checkQuery = await pool.request()
            .input('assignmentID', sql.Int, actualAssignmentID)
            .input('departmentID', sql.Int, hodDepartmentID)
            .query(`
                SELECT ca.AssignmentID 
                FROM dbo.course_assignment ca
                JOIN dbo.course c ON ca.CourseID = c.CourseID
                WHERE ca.AssignmentID = @assignmentID
                AND (c.CourseCategory = 'general' 
                    OR c.FacultyID IN (SELECT FacultyID FROM dbo.appdepartment WHERE DepartmentID = @departmentID)
                    OR c.DepartmentID = @departmentID)
            `);

        if (checkQuery.recordset.length === 0) {
            return next(errorHandler(403, "You don't have permission to unassign this course"));
        }

        // Update assignment to remove lecturer
        await pool.request()
            .input('assignmentID', sql.Int, actualAssignmentID)
            .query(`
                UPDATE dbo.course_assignment 
                SET LecturerID = NULL,
                    AssignmentStatus = 'unassigned'
                WHERE AssignmentID = @assignmentID
            `);

        res.status(200).json({
            success: true,
            message: "Course unassigned successfully"
        });

    } catch (error) {
        console.error('Unassign Error:', error);
        return next(errorHandler(500, "Server Error: " + error.message))
    }
}
