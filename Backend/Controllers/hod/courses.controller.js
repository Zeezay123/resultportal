import {sql, poolPromise} from '../../db.js'
import { errorHandler } from '../../utils/error.js'
 


export const getCourses = async (req, res, next) => {

    const search = req.query.search || ''; // Search term for course code or title
    const courseCategory = req.query.courseCategory || ''; // general, faculty, department
    const courseType = req.query.courseType || ''; // core, elective
    const assignmentStatus = req.query.assignmentStatus || 'all'; // all, assigned, unassigned
    const programmeID = req.query.programmeID || ''; // Programme filter
    const hodDepartmentID = req.params.id; // HOD's department ID from auth
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 10;
   const offset = (page - 1) * limit;


    try {
      const pool = await poolPromise;
      
      if(!pool){
          return next(errorHandler(500, "Database connection failed"))
      }

      // Get the active session and semester
      const activeSessionResult = await pool.request()
        .query(`
          SELECT SessionID, SessionName 
          FROM dbo.sessions 
          WHERE isActive = 1
        `);

      if(activeSessionResult.recordset.length === 0){
        return next(errorHandler(404, "No active session found"))
      }

      const sessionID = activeSessionResult.recordset[0].SessionID;

      const activeSemesterResult = await pool.request()
        .query(`
          SELECT SemesterID, SemesterName 
          FROM dbo.semesters 
          WHERE isActive = 'true'
        `);

      if(activeSemesterResult.recordset.length === 0){
        return next(errorHandler(404, "No active semester found"))
      }

      const semesterID = activeSemesterResult.recordset[0].SemesterID;

      // Build WHERE conditions and filters once - will be reused for both queries
      const whereConditions = ['1=1'];
      
      // HOD can only see courses related to their department - apply this filter first
      if (hodDepartmentID) {
        whereConditions.push(`
                      c.SemesterID = @semesterID
                   
                       AND
                    ( c.CourseCategory = 'faculty' AND c.FacultyID IN (SELECT FacultyID FROM dbo.appdepartment WHERE DepartmentID = @hodDept)
                      OR c.DepartmentID = @hodDept)`);
      }

      // Filter course assignments by active session and semester
      whereConditions.push(`(ca.SessionID = @sessionID AND ca.SemesterID = @semesterID OR ca.SessionID IS NULL)`);


      
      const params = [];
      let paramIndex = 1;
      let filterClause = ''; 

      // Search filter
      if (search) {
        filterClause += ` AND (c.CourseCode LIKE @param${paramIndex} OR c.CourseName LIKE @param${paramIndex})`;
        params.push({ name: `param${paramIndex}`, type: sql.VarChar, value: `%${search}%` });
        paramIndex++;
      }

      // Course category filter
      if (courseCategory) {
        filterClause += ` AND c.CourseCategory = @param${paramIndex}`;
        params.push({ name: `param${paramIndex}`, type: sql.VarChar, value: courseCategory });
        paramIndex++;
      }

      // Course type filter
      if (courseType) {
        filterClause += ` AND c.CourseType = @param${paramIndex}`;
        params.push({ name: `param${paramIndex}`, type: sql.VarChar, value: courseType });
        paramIndex++;
      }

      // Programme filter
      if (programmeID) {
        filterClause += ` AND ca.TeachingProgrammeID = @param${paramIndex}`;
        params.push({ name: `param${paramIndex}`, type: sql.Int, value: parseInt(programmeID) });
        paramIndex++;
      }

      // Assignment status filter
      if (assignmentStatus === 'assigned') {
        filterClause += ` AND ca.LecturerID IS NOT NULL`;
      } else if (assignmentStatus === 'unassigned') {
        filterClause += ` AND ca.LecturerID IS NULL`;
      }

      // Add hodDept parameter if needed
      if (hodDepartmentID) {
        params.push({ name: 'hodDept', type: sql.Int, value: hodDepartmentID });
      }

      // Add session and semester parameters
      params.push({ name: 'sessionID', type: sql.Int, value: sessionID });
      params.push({ name: 'semesterID', type: sql.Int, value: semesterID });

      // Get total count using the reusable filter
      let countQuery = `
        SELECT COUNT(*) as TotalCount
        FROM dbo.course c
        LEFT JOIN dbo.course_assignment ca ON ca.CourseID = c.CourseID
        WHERE ${whereConditions.join(' AND ')}
        ${filterClause}
      `;

      const countRequest = pool.request();
      params.forEach(param => {
        countRequest.input(param.name, param.type, param.value);
      });
      
      const countResult = await countRequest.query(countQuery);
      const totalCourses = countResult.recordset[0].TotalCount;

      if(totalCourses === 0){
        return res.status(200).json({message: "No courses found matching the criteria"});
      }

      const totalPages = Math.ceil(totalCourses / limit);

      // paginated query using the same filter
      let query = `
        SELECT 
         
          c.CourseID,
          c.CourseCode,
          c.CourseName,
          c.CreditUnits,
          ca.AssignmentID,
          c.CourseCategory,
          c.CourseType,
          ca.TeachingDepartmentID,
          ca.TeachingProgrammeID,
          ca.FacultyID,
          f.FacultyName,
          d.DepartmentName,
          l.LevelName,
          p.ProgrammeName,
          ca.AssignmentStatus,
          ca.AssignedDate,
          ca.LecturerID,
          CONCAT(staff.LastName, ' ', staff.OtherNames) AS AssignedLecturer,
          s.SemesterName,
          sess.SessionName
        FROM dbo.course c
        LEFT JOIN dbo.course_assignment ca ON ca.CourseID = c.CourseID
        LEFT JOIN dbo.appfaculty f ON ca.FacultyID = f.FacultyID
        LEFT JOIN dbo.appdepartment d ON ca.TeachingDepartmentID = d.DepartmentID
        LEFT JOIN dbo.levels l ON c.LevelID = l.LevelID
        LEFT JOIN dbo.programmes p ON ca.TeachingProgrammeID = p.ProgrammeID
        LEFT JOIN dbo.staff ON ca.LecturerID = staff.StaffID
        LEFT JOIN dbo.semesters s ON ca.SemesterID = s.SemesterID
        LEFT JOIN dbo.sessions sess ON ca.SessionID = sess.SessionID
        WHERE ${whereConditions.join(' AND ')}
        ${filterClause}
        ORDER BY c.CourseCode
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;
      
      const request = pool.request();
      
      // Set request timeout to 1 second
      request.timeout = 1000;
      
      // Add all filter params
      params.forEach(param => {
        request.input(param.name, param.type, param.value);
      });
      
      // Add pagination params
      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, limit);

      const result = await request.query(query);

      // Build response with pagination
      const response = {
        success: true,
        count: result.recordset.length,
        totalCourses,
        totalPages,
        currentPage: page,
        courses: result.recordset
      };
      
      res.status(200).json(response);
        
    } catch (error) {
      console.error('Error fetching courses:', error.stack);
       return next(errorHandler(500, "Server Error: " + error.message))
    }

}

export const getCourseStats = async (req, res, next) => {
    const hodDepartmentID = req.params.id;

    try {
        const pool = await poolPromise;
        
        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        if (!hodDepartmentID) {
            return next(errorHandler(400, "HOD Department ID is required"));
        }

        // Get the active session and semester
        const activeSessionResult = await pool.request()
            .query(`
                SELECT SessionID, SessionName 
                FROM dbo.sessions 
                WHERE isActive = 1
            `);

        if(activeSessionResult.recordset.length === 0){
            return next(errorHandler(404, "No active session found"))
        }

        const sessionID = activeSessionResult.recordset[0].SessionID;

        const activeSemesterResult = await pool.request()
            .query(`
                SELECT SemesterID, SemesterName 
                FROM dbo.semesters 
                WHERE isActive = 'true'
            `);

        if(activeSemesterResult.recordset.length === 0){
            return next(errorHandler(404, "No active semester found"))
        }

        const semesterID = activeSemesterResult.recordset[0].SemesterID;

        // Single query to get all counts efficiently - filtered by active session/semester
        const query = `
            SELECT 
                COUNT(DISTINCT ca.CourseID) as TotalCourses,
                COUNT(DISTINCT CASE WHEN ca.AssignmentStatus = 'assigned' THEN ca.CourseID ELSE NULL END) as AssignedCourses,
                COUNT(DISTINCT CASE WHEN ca.AssignmentStatus = 'unassigned' THEN ca.CourseID ELSE NULL END) as UnassignedCourses

            FROM dbo.course_assignment ca
            
            WHERE ca.SessionID = @sessionID
            AND ca.SemesterID = @semesterID
            AND (ca.CourseCategory = 'general' 

                  OR (ca.CourseCategory = 'faculty' AND ca.FacultyID IN (SELECT FacultyID FROM dbo.appdepartment WHERE DepartmentID = @hodDept)) 
            
                  OR ca.DepartmentID = @hodDept)
        `;

        const result = await pool.request()
            .input('hodDept', sql.Int, hodDepartmentID)
            .input('sessionID', sql.Int, sessionID)
            .input('semesterID', sql.Int, semesterID)
            .query(query);

        const stats = result.recordset[0];

        res.status(200).json({
            success: true,
            stats: {
                total: stats.TotalCourses || 0,
                assigned: stats.AssignedCourses || 0,
                unassigned: stats.UnassignedCourses || 0
            }
        });

    } catch (error) {
        console.error('Error fetching course stats:', error);
        return next(errorHandler(500, "Server Error: " + error.message));
    }
};


//get unassiged courses for a level in the HOD's department
export const unassignedCourses = async (req, res, next) => {


  const LevelID = req.query.levelID; // LevelID from query parameter
    try{
        const pool = await poolPromise;
        
        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

        const hodDepartmentID = parseInt(req.user.departmentID); // HOD's department ID from URL
       
        
        if (!hodDepartmentID || isNaN(hodDepartmentID)) {
            return next(errorHandler(400, "Invalid department ID"))
        }

  
   
        console.log('Getting unassigned courses for Department:', hodDepartmentID)

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
         

        
        // Query courses from course table that are NOT in course_assignment for current session/semester
        // OR courses in course_assignment but not yet assigned to a lecturer
        // GST courses can be assigned to multiple lecturers, so they should always appear
        let query = `SELECT
           c.CourseID,
           c.CourseCode,
           c.CourseName,
           c.CreditUnits,
           c.CourseCategory,
           c.CourseType,
           c.SemesterID,
           l.LevelName,
           p.ProgrammeName,
           d.DepartmentName,
           f.FacultyName
         FROM dbo.course c
         LEFT JOIN dbo.levels l ON c.LevelID = l.LevelID
         LEFT JOIN dbo.programmes p ON c.ProgrammeID = p.ProgrammeID
         LEFT JOIN dbo.appdepartment d ON c.DepartmentID = d.DepartmentID
         LEFT JOIN dbo.appfaculty f ON c.FacultyID = f.FacultyID
         WHERE 
          ( c.CourseCategory = 'faculty' AND c.FacultyID IN (SELECT FacultyID FROM dbo.appdepartment WHERE DepartmentID = @hodDept)
           OR c.DepartmentID = @hodDept)
         
         AND c.SemesterID = @semesterID
         AND c.LevelID = @LevelID
         AND (
           d.DepartmentCode = 'GST'
           OR c.CourseID NOT IN (
             SELECT CourseID FROM dbo.course_assignment 
             WHERE SessionID = @sessionID 
             AND SemesterID = @semesterID
             AND LecturerID IS NOT NULL
           )
         )
         ORDER BY c.CourseCode`;

        const request = pool.request()
            .input('hodDept', sql.Int, hodDepartmentID)
            .input('sessionID', sql.Int, parseInt(sessionID))
            .input('semesterID', sql.Int, parseInt(semesterID))
            .input('LevelID', sql.Int, parseInt(LevelID));

        const result = await request.query(query);
       
        return res.status(200).json({
            success: true,
            count: result.recordset.length,
            courses: result.recordset
        })
    } catch(error){
        return next(errorHandler(500, "Server Error: " + error.message))
    }
}


//get departments based on courseType and departmentID
export const getCourseDepartments = async (req, res, next)=>{
    const courseID = req.params.id;
    const departmentID = req.user.departmentID;

    if(!courseID || !departmentID){
        return next(errorHandler(400, "courseID and departmentID are required"));
    }



    try {
        
        const pool = await poolPromise;
        
        if(!pool){
            return next(errorHandler(500, "Database connection failed"));
        }
        
        const coursepool = await pool.request()
        .input('courseID', sql.Int, parseInt(courseID))
        .query(`SELECT CourseCategory FROM dbo.course WHERE CourseID = @courseID`);

        if(coursepool.recordset.length === 0){
            return next(errorHandler(404, "Course not found"));
        }

        const courseType = coursepool.recordset[0].CourseCategory;

        let query = `SELECT DepartmentID, DepartmentName FROM dbo.appdepartment WHERE 1=1`;

        if(courseType === 'faculty'){
            query += ` AND FacultyID = (SELECT FacultyID FROM dbo.appdepartment WHERE DepartmentID = @departmentID)`;
        } else if(courseType === 'department'){
            query += ` AND DepartmentID = @departmentID`;
        } 
       
        const request = pool.request()
        .input('departmentID', sql.Int, parseInt(departmentID))
        .input('courseType', sql.VarChar, courseType);

        const result = await request.query(query);
        return res.json({ success: true, departments: result.recordset });
    } catch (error) {
        console.error('Error fetching course departments:', error.stack);
        return next(errorHandler(500, 'Failed to fetch course departments', error.message));
    }
}



