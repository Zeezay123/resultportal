import {sql, poolPromise} from '../../db.js'
import { errorHandler } from '../../utils/error.js'


// Get all lecturers in HOD's department
export const getLecturers = async (req, res, next) => {
    const hodDepartmentID = req.user?.departmentID; // HOD's department ID from auth
    const hodStaffCode = req.user?.id;
    const search = req.query.search || '';
    const orderBy = req.query.orderBy || ''; // asc or desc for units

    console.log('HOD Department ID:', hodDepartmentID);
    console.log('User object:', req.user);
    console.log('HOD Staff Code:', hodStaffCode);

    try {
        const pool = await poolPromise;
        



        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }



        
         //get the active session 
         const activeSessionResult = await pool.request()
         .query(`
            SELECT  SessionID , SessionName 
            FROM dbo.sessions 
            WHERE isActive = 1
         `);

         if(activeSessionResult.recordset.length === 0){
            return next(errorHandler(404, "No active session found"))
         }
  
         const sessionID = activeSessionResult.recordset[0].SessionID;
        


         //get active semester
         const activeSemesterResult = await pool.request()
         .query(`
            SELECT  SemesterID , SemesterName 
            FROM dbo.semesters 
            WHERE isActive = 'true'
         `);

        
         if(activeSemesterResult.recordset.length === 0){
            return next(errorHandler(404, "No active semester found"))
         }

         const semesterID = activeSemesterResult.recordset[0].SemesterID;

        // Get HOD's StaffID
        const hodResult = await pool.request()
            .input('staffCode', sql.VarChar, hodStaffCode)
          
            .query('SELECT StaffID FROM dbo.staff WHERE StaffCode = @staffCode');
        
        const hodStaffID = hodResult.recordset.length > 0 ? hodResult.recordset[0].StaffID : null;

        let query = `
            SELECT 
                s.StaffID as LecturerID,
                s.LastName,
                s.OtherNames,
                s.Email,
                s.DepartmentID,
                d.DepartmentName,
                ca.SessionID,
                ca.SemesterID,
            
                COUNT(ca.AssignmentID) AS TotalCoursesAssigned,
                STRING_AGG(c.CourseCode, ', ') AS AssignedCourses,
                STRING_AGG(CAST(c.CourseName AS VARCHAR), ', ') AS AssignedCourseNames,
                STRING_AGG(CAST(ca.AssignmentID AS VARCHAR), ', ') AS AssignmentIDs,
                STRING_AGG(CAST(ca.TeachingProgrammeID AS VARCHAR), ', ') AS TeachingProgrammeIDs,
                STRING_AGG(CAST(ca.TeachingDepartmentID AS VARCHAR), ', ') AS TeachingDepartmentIDs,
                STRING_AGG(CAST(tp.ProgrammeName AS VARCHAR), ', ') AS TeachingProgrammeNames,
                STRING_AGG(CAST(td.DepartmentName AS VARCHAR), ', ') AS TeachingDepartmentNames
            FROM dbo.staff s
            LEFT JOIN dbo.appdepartment d ON s.DepartmentID = d.DepartmentID
            LEFT JOIN dbo.course_assignment ca ON s.StaffID = ca.LecturerID
                AND (
                    ca.AssignedBy = @hodStaffID  -- Show assignments made by this HOD
                    OR ca.TeachingDepartmentID = @departmentID  -- Or assignments in their department
                )
            LEFT JOIN dbo.course c ON ca.CourseID = c.CourseID
            LEFT JOIN dbo.programmes tp ON ca.TeachingProgrammeID = tp.ProgrammeID
            LEFT JOIN dbo.appdepartment td ON ca.TeachingDepartmentID = td.DepartmentID 
            WHERE 
            ca.SemesterID = @semesterID
            AND ca.SessionID = @sessionID
        `;

        const params = [];
        let paramIndex = 1;
        
        // Only filter by department if hodDepartmentID is provided
        if (hodDepartmentID) {
            query += `AND s.DepartmentID = @departmentID`;
        }

        // Search filter
        if (search) {
            query += ` AND (s.LastName LIKE @search OR s.OtherNames LIKE @search OR s.Email LIKE @search)`;
        }

        query += ` GROUP BY s.StaffID, s.LastName, s.OtherNames, s.Email, s.DepartmentID, d.DepartmentName, ca.SessionID, ca.SemesterID`;

        // Order by courses assigned count
        if (orderBy === 'asc') {
            query += ` ORDER BY TotalCoursesAssigned ASC`;
        } else if (orderBy === 'desc') {
            query += ` ORDER BY TotalCoursesAssigned DESC`;
        } else {
            query += ` ORDER BY s.LastName ASC`;
        }


        const request = pool.request()
          .input(`semesterID`,sql.Int, semesterID)
            .input('sessionID', sql.Int, sessionID)

        if (hodStaffID) {
            request.input('hodStaffID', sql.Int, hodStaffID)
            ;
        }
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

// Lightweight endpoint: return only lecturer count for HOD (fast summary)
export const getLecturersCount = async (req, res, next) => {
    const hodDepartmentID = req.user?.departmentID;
    try {
        const pool = await poolPromise;
        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

        const request = pool.request();
        if (hodDepartmentID) request.input('departmentID', sql.Int, hodDepartmentID);

        const query = hodDepartmentID
            ? 'SELECT COUNT(*) AS count FROM dbo.staff WHERE DepartmentID = @departmentID'
            : 'SELECT COUNT(*) AS count FROM dbo.staff';

        const result = await request.query(query);
        const count = result.recordset[0]?.count || 0;

        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error('Error in getLecturersCount:', error);
        return next(errorHandler(500, "Server Error: " + error.message))
    }
}


// Assign course to lecturer
export const assignCourse = async (req, res, next) => {
    const { courseID, lecturerID, AssignedprogrammeID, AssignedDepartmentID } = req.body;



    const hodDepartmentID = req.user?.departmentID;
    const hodStaffCode = req.user?.id; // Get HOD's StaffCode from JWT
   
    
    // Validate required fields
    if (!courseID || !lecturerID || !AssignedprogrammeID || !AssignedDepartmentID) {
        return next(errorHandler(400, "CourseID, Lecturer Name, Programme Name, and Department Name are required"));
    }


    try {
        const pool = await poolPromise;
        
        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

        // Get HOD's StaffID from StaffCode
        const hodResult = await pool.request()
            .input('staffCode', sql.VarChar, hodStaffCode)
            .query('SELECT StaffID FROM dbo.staff WHERE StaffCode = @staffCode');
        
        if (hodResult.recordset.length === 0) {
            return next(errorHandler(404, "HOD staff record not found"));
        }
        
        const hodStaffID = hodResult.recordset[0].StaffID;

 //get the active session 
         const activeSessionResult = await pool.request()
         .query(`
            SELECT  SessionID , SessionName 
            FROM dbo.sessions 
            WHERE isActive = 1
         `);

         if(activeSessionResult.recordset.length === 0){
            return next(errorHandler(404, "No active session found"))
         }
  
         const sessionID = activeSessionResult.recordset[0].SessionID;
        


         //get active semester
         const activeSemesterResult = await pool.request()
         .query(`
            SELECT  SemesterID , SemesterName 
            FROM dbo.semesters 
            WHERE isActive = 'true'
         `);

        
         if(activeSemesterResult.recordset.length === 0){
            return next(errorHandler(404, "No active semester found"))
         }

         const semesterID = activeSemesterResult.recordset[0].SemesterID;

        // Get course details from course table and validate HOD has permission
        const courseCheck = await pool.request()
            .input('courseID', sql.Int, courseID)
            .input('departmentID', sql.Int, hodDepartmentID)
            .query(`
                SELECT 
                    c.CourseID,
                    c.CourseCode,
                    c.CourseCategory,
                    c.CourseType,
                    c.ProgrammeID,
                    c.LevelID,
                    c.DepartmentID,
                    c.FacultyID
                FROM dbo.course c
                WHERE c.CourseID = @courseID 
                AND (

                    c.CourseCategory = 'faculty' AND c.FacultyID IN (SELECT FacultyID FROM dbo.appdepartment WHERE DepartmentID = @departmentID)
                    OR c.DepartmentID = @departmentID
                )
            `);

        if (courseCheck.recordset.length === 0) {
            return next(errorHandler(403, "You don't have permission to assign this course or course does not exist"));
        }

        const course = courseCheck.recordset[0];

        // Check if this lecturer already has this course assigned for this session/semester
        const existingAssignment = await pool.request()
            .input('courseID', sql.Int, courseID)
            .input('lecturerID', sql.Int, lecturerID)
            .input('semesterID', sql.Int, semesterID)
            .input('sessionID', sql.Int, sessionID)
            .input('TeachingProgrammeID', sql.Int, AssignedprogrammeID)
            .input(`TeachingDepartmentID`, sql.Int, AssignedDepartmentID)
            .query(`
                SELECT AssignmentID FROM dbo.course_assignment 
                WHERE CourseID = @courseID 
                AND LecturerID = @lecturerID
                AND SemesterID = @semesterID 
                AND SessionID = @sessionID
                AND TeachingProgrammeID = @TeachingProgrammeID
                AND TeachingDepartmentID = @TeachingDepartmentID
            `);

        if (existingAssignment.recordset.length > 0) {
            return next(errorHandler(400, "This course is already assigned to this lecturer for this semester/session"));
        }

        // For department courses, check if already assigned to another lecturer
        // (department courses can only have one lecturer per session/semester)
        if (course.CourseCategory === 'department') {
            const departmentAssignment = await pool.request()
                .input('courseID', sql.Int, courseID)
                .input('semesterID', sql.Int, semesterID)
                .input('sessionID', sql.Int, sessionID)
                .input('TeachingProgrammeID', sql.Int, AssignedprogrammeID)
                .input(`TeachingDepartmentID`, sql.Int, AssignedDepartmentID)
                .query(`
                    SELECT AssignmentID FROM dbo.course_assignment 
                    WHERE CourseID = @courseID
                    AND SemesterID = @semesterID 
                    AND SessionID = @sessionID
                    AND LecturerID IS NOT NULL
                    AND TeachingProgrammeID = @TeachingProgrammeID
                    AND TeachingDepartmentID = @TeachingDepartmentID
                `);

            if (departmentAssignment.recordset.length > 0) {
                return next(errorHandler(400, "This department course is already assigned to another lecturer for this semester/session"));
            }
        }
        
        // Insert new course assignment record with AssignedBy field
        const assignQuery = `
            INSERT INTO dbo.course_assignment 
            (CourseID, CourseCode, LecturerID, SessionID, SemesterID, ProgrammeID, CourseCategory, CourseType, LevelID, DepartmentID, FacultyID, AssignedDate, AssignmentStatus, TeachingProgrammeID, TeachingDepartmentID, AssignedBy)
            VALUES 
            (@courseID, @courseCode, @lecturerID, @sessionID, @semesterID, @programmeID, @courseCategory, @courseType, @levelID, @departmentID, @facultyID, GETDATE(), 'assigned', @TeachingProgrammeID, @TeachingDepartmentID, @assignedBy)
        `;

        await pool.request()
            .input('courseID', sql.Int, courseID)
            .input('courseCode', sql.VarChar, course.CourseCode)
            .input('lecturerID', sql.Int, lecturerID)
            .input('sessionID', sql.Int, sessionID)
            .input('semesterID', sql.Int, semesterID)
            .input('programmeID', sql.Int, course.ProgrammeID)
            .input('courseCategory', sql.VarChar, course.CourseCategory)
            .input('courseType', sql.VarChar, course.CourseType)
            .input('levelID', sql.Int, course.LevelID)
            .input('departmentID', sql.Int, course.DepartmentID)
            .input('facultyID', sql.Int, course.FacultyID)
            .input('TeachingProgrammeID', sql.Int, AssignedprogrammeID)
            .input(`TeachingDepartmentID`, sql.Int, AssignedDepartmentID)
            .input('assignedBy', sql.Int, hodStaffID)
            .query(assignQuery);

        res.status(200).json({
            success: true,
            message: "Course assigned successfully"
        });

    } catch (error) {
        return next(errorHandler(500, "Server Error: " + error.message))
        console.error('Error in assignCourse:', error.stack);
    }
}


// Unassign course from lecturer
export const unassignCourse = async (req, res, next) => {
    const { assignmentID} = req.body;
    const hodDepartmentID = req.user?.departmentID;
    const hodStaffCode = req.user?.id;

    console.log('Unassign Request:', req.body);

    try {
        const pool = await poolPromise;
        
        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

        if (!assignmentID) {
            return next(errorHandler(400, "AssignmentID is required"));
        }

        // Get HOD's StaffID
        const hodResult = await pool.request()
            .input('staffCode', sql.VarChar, hodStaffCode)
            .query('SELECT StaffID FROM dbo.staff WHERE StaffCode = @staffCode');
        
        if (hodResult.recordset.length === 0) {
            return next(errorHandler(404, "HOD staff record not found"));
        }
        
        const hodStaffID = hodResult.recordset[0].StaffID;

        // Verify HOD has permission to unassign this course
        // Permission granted if:
        // 1. HOD assigned this course (AssignedBy = hodStaffID), OR
        // 2. Course belongs to HOD's department (for department courses)
        const checkQuery = await pool.request()
            .input('assignmentID', sql.Int, assignmentID)
            .input('departmentID', sql.Int, hodDepartmentID)
            .input('hodStaffID', sql.Int, hodStaffID)
            .query(`
                SELECT ca.AssignmentID, ca.CourseCategory, ca.AssignedBy, ca.TeachingDepartmentID
                FROM dbo.course_assignment ca
                WHERE ca.AssignmentID = @assignmentID
                AND (
                    ca.AssignedBy = @hodStaffID  -- HOD who assigned it can unassign
                    OR (
                        -- For courses in HOD's teaching department
                        ca.TeachingDepartmentID = @departmentID
                        AND ca.CourseCategory = 'department'
                    )
                )
            `);

        if (checkQuery.recordset.length === 0) {
            return next(errorHandler(403, "You don't have permission to unassign this course. Only the HOD who assigned it can unassign it."));
        }

        const courseCategory = checkQuery.recordset[0].CourseCategory;

        // For general/faculty courses: DELETE the row (removes this lecturer's assignment)
        // For department courses: UPDATE to NULL (keeps the row for future assignment)
        if (courseCategory === 'general' || courseCategory === 'faculty') {
            await pool.request()
                .input('assignmentID', sql.Int, assignmentID)
                .query(`
                    DELETE FROM dbo.course_assignment 
                    WHERE AssignmentID = @assignmentID
                `);
        } else {
            await pool.request()
                .input('assignmentID', sql.Int, assignmentID)
                .query(`
                    UPDATE dbo.course_assignment 
                    SET LecturerID = NULL,
                        AssignmentStatus = 'unassigned'
                    WHERE AssignmentID = @assignmentID
                `);
        }

        res.status(200).json({
            success: true,
            message: "Course unassigned successfully"
        });

    } catch (error) {
        console.error('Unassign Error:', error);
        return next(errorHandler(500, "Server Error: " + error.message))
    }
}

//get lecturers in a department for course assignment dropdown
export const getlecturerDepartment = async (req, res, next)=>{

    const hodID = req.user.departmentID
    const departmentID = parseInt(req.params.id)

    if(!hodID){
        return next(errorHandler(404, 'DepartmentId Required '))
    }

    try {

          const pool = await poolPromise
          if(!pool){
            return next(errorHandler(500, 'Database connection failed'))    
                  }



                const departmentCode = await pool.request()
                .input('departmentID', sql.Int, departmentID)
                .query('SELECT DepartmentCode, DepartmentName, DepartmentID FROM dbo.appdepartment WHERE DepartmentID = @departmentID')

                const DepartmentCode = departmentCode.recordset[0]?.DepartmentCode;
                

                if(!DepartmentCode){
                    return next(errorHandler(404, 'Department not found'))
                }
     
                
                let query = `Select StaffID, StaffCode, CONCAT(LastName, ' ', Othernames) as FullName from dbo.staff WHERE 1=1 `

               if(DepartmentCode !== 'GST'){
                   query += ` AND DepartmentID = @departmentID`
                }

               const  result = await pool.request()
                .input('departmentID', sql.Int, departmentID)
                .query(query)

                res.status(200).json({
                    success: true,
                    lecturers: result.recordset
                })
        
    } catch (error) {
        console.error('error fetching the departments', error.stack)
        return next(errorHandler(500,"error fetching", error.message))
    }
}


//get assigned courses for all lecturers 