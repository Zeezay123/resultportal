import {sql, poolPromise} from '../../db.js'
import { errorHandler } from '../../utils/error.js'
 


export const getCourses = async (req, res, next) => {

    const search = req.query.search || ''; // Search term for course code or title
    const courseCategory = req.query.courseCategory || ''; // general, faculty, department
    const courseType = req.query.courseType || ''; // core, elective
    const assignmentStatus = req.query.assignmentStatus || 'all'; // all, assigned, unassigned
    const programmeID = req.query.programmeID || ''; // Programme filter
    const hodDepartmentID = req.params.id; // HOD's department ID from auth
   


    try {
      const pool = await poolPromise;
      
      if(!pool){
          return next(errorHandler(500, "Database connection failed"))
      }

      // Build WHERE conditions first for better query optimization
      const whereConditions = ['1=1'];
      
      // HOD can only see courses related to their department - apply this filter first
      if (hodDepartmentID) {
        whereConditions.push(`(c.CourseCategory = 'general' 
                      OR c.FacultyID IN (SELECT FacultyID FROM dbo.appdepartment WHERE DepartmentID = @hodDept) 
                      OR c.DepartmentID = @hodDept)`);
      }

      let query = `
        SELECT 
          c.CourseID,
          c.CourseCode,
          c.CourseName,
          c.CreditUnits,
          c.CourseCategory,
          c.CourseType,
          c.DepartmentID,
          c.FacultyID,
          f.FacultyName,
          d.DepartmentName,
          l.LevelName,
          p.ProgrammeName,
          ca.AssignmentStatus,
          ca.AssignedDate,
          ca.AssignmentID,
          ca.LecturerID,
          CONCAT(staff.LastName, ' ', staff.OtherNames) AS AssignedLecturer,
          s.SemesterName,
          sess.SessionName
        FROM dbo.course c
        INNER JOIN dbo.course_assignment ca ON c.CourseID = ca.CourseID
        LEFT JOIN dbo.appfaculty f ON c.FacultyID = f.FacultyID
        LEFT JOIN dbo.appdepartment d ON c.DepartmentID = d.DepartmentID
        LEFT JOIN dbo.levels l ON c.LevelID = l.LevelID
        LEFT JOIN dbo.programmes p ON c.ProgrammeID = p.ProgrammeID
        LEFT JOIN dbo.staff ON ca.LecturerID = staff.StaffID
        LEFT JOIN dbo.semesters s ON ca.SemesterID = s.SemesterID
        LEFT JOIN dbo.sessions sess ON ca.SessionID = sess.SessionID
        WHERE ${whereConditions.join(' AND ')}
      `;

      const params = [];
      let paramIndex = 1;

      // Search filter
      if (search) {
        query += ` AND (c.CourseCode LIKE @param${paramIndex} OR c.CourseName LIKE @param${paramIndex})`;
        params.push({ name: `param${paramIndex}`, type: sql.VarChar, value: `%${search}%` });
        paramIndex++;
      }

      // Course category filter
      if (courseCategory) {
        query += ` AND c.CourseCategory = @param${paramIndex}`;
        params.push({ name: `param${paramIndex}`, type: sql.VarChar, value: courseCategory });
        paramIndex++;
      }

      // Course type filter
      if (courseType) {
        query += ` AND c.CourseType = @param${paramIndex}`;
        params.push({ name: `param${paramIndex}`, type: sql.VarChar, value: courseType });
        paramIndex++;
      }

      // Programme filter
      if (programmeID) {
        query += ` AND c.ProgrammeID = @param${paramIndex}`;
        params.push({ name: `param${paramIndex}`, type: sql.Int, value: parseInt(programmeID) });
        paramIndex++;
      }

      // Assignment status filter
      if (assignmentStatus === 'assigned') {
        query += ` AND ca.LecturerID IS NOT NULL`;
      } else if (assignmentStatus === 'unassigned') {
        query += ` AND ca.LecturerID IS NULL`;
      }

      // Add hodDept parameter if needed
      if (hodDepartmentID) {
        params.push({ name: 'hodDept', type: sql.Int, value: hodDepartmentID });
      }

      query += ` ORDER BY c.CourseCode`;
      
      // Check if pagination is requested
      const usePagination = req.query.page || req.query.limit || req.query.offset;
      let totalCount = 0;
      let totalPages = 0;
      
      if (usePagination) {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = parseInt(req.query.offset) || (page - 1) * limit;
        
        // Build count query with same filters
        let countQuery = `
          SELECT COUNT(DISTINCT c.CourseID) as TotalCount
          FROM dbo.course c
          INNER JOIN dbo.course_assignment ca ON c.CourseID = ca.CourseID
          LEFT JOIN dbo.appfaculty f ON c.FacultyID = f.FacultyID
          LEFT JOIN dbo.appdepartment d ON c.DepartmentID = d.DepartmentID
          LEFT JOIN dbo.levels l ON c.LevelID = l.LevelID
          LEFT JOIN dbo.programmes p ON c.ProgrammeID = p.ProgrammeID
          WHERE ${whereConditions.join(' AND ')}`;
        
        // Apply all the same filters to count query
        let countParamIndex = 1;
        if (search) {
          countQuery += ` AND (c.CourseCode LIKE @countParam${countParamIndex} OR c.CourseName LIKE @countParam${countParamIndex})`;
          countParamIndex++;
        }
        if (courseCategory) {
          countQuery += ` AND c.CourseCategory = @countParam${countParamIndex}`;
          countParamIndex++;
        }
        if (courseType) {
          countQuery += ` AND c.CourseType = @countParam${countParamIndex}`;
          countParamIndex++;
        }
        if (programmeID) {
          countQuery += ` AND c.ProgrammeID = @countParam${countParamIndex}`;
          countParamIndex++;
        }
        if (assignmentStatus === 'assigned') {
          countQuery += ` AND ca.LecturerID IS NOT NULL`;
        } else if (assignmentStatus === 'unassigned') {
          countQuery += ` AND ca.LecturerID IS NULL`;
        }
        
        // Add pagination to main query
        query += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
        params.push({ name: 'offset', type: sql.Int, value: offset });
        params.push({ name: 'limit', type: sql.Int, value: limit });
        
        // Execute count query first
        const countRequest = pool.request();
        countRequest.timeout = 30000;
        
        // Add count parameters
        let countIdx = 1;
        if (search) {
          countRequest.input(`countParam${countIdx}`, sql.VarChar, `%${search}%`);
          countIdx++;
        }
        if (courseCategory) {
          countRequest.input(`countParam${countIdx}`, sql.VarChar, courseCategory);
          countIdx++;
        }
        if (courseType) {
          countRequest.input(`countParam${countIdx}`, sql.VarChar, courseType);
          countIdx++;
        }
        if (programmeID) {
          countRequest.input(`countParam${countIdx}`, sql.Int, parseInt(programmeID));
          countIdx++;
        }
        if (hodDepartmentID) {
          countRequest.input('hodDept', sql.Int, hodDepartmentID);
        }
        
        const countResult = await countRequest.query(countQuery);
        totalCount = countResult.recordset[0]?.TotalCount || 0;
        totalPages = Math.ceil(totalCount / limit);
      }
      
      const request = pool.request();
      
      // Set request timeout to 30 seconds
      request.timeout = 30000;
      
      params.forEach(param => {
        request.input(param.name, param.type, param.value);
      });

      const result = await request.query(query);
      
      console.log('Courses fetched for HOD:', result.recordset.length);
      
      // Build response
      const response = {
        success: true,
        count: result.recordset.length,
        courses: result.recordset
      };
      
      // Add pagination metadata if pagination was used
      if (usePagination) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        response.pagination = {
          currentPage: page,
          pageSize: limit,
          totalCount: totalCount,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        };
      }
      
      res.status(200).json(response);
        
    } catch (error) {
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

        // Single query to get all counts efficiently
        const query = `
            SELECT 
                COUNT(DISTINCT c.CourseID) as TotalCourses,
                SUM(CASE WHEN ca.LecturerID IS NOT NULL THEN 1 ELSE 0 END) as AssignedCourses,
                SUM(CASE WHEN ca.LecturerID IS NULL THEN 1 ELSE 0 END) as UnassignedCourses
            FROM dbo.course c
            INNER JOIN dbo.course_assignment ca ON c.CourseID = ca.CourseID
            WHERE (c.CourseCategory = 'general' 
                  OR c.FacultyID IN (SELECT FacultyID FROM dbo.appdepartment WHERE DepartmentID = @hodDept) 
                  OR c.DepartmentID = @hodDept)
        `;

        const result = await pool.request()
            .input('hodDept', sql.Int, hodDepartmentID)
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

export const unassignedCourses = async (req, res, next) => {



    try{
        const pool = await poolPromise;
        
        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

        const hodDepartmentID = parseInt(req.params.id); // HOD's department ID from URL
        
        if (!hodDepartmentID || isNaN(hodDepartmentID)) {
            return next(errorHandler(400, "Invalid department ID"))
        }
   
        console.log('Got the HOD Department ID:', hodDepartmentID)
       let query =`SELECT 
       c.CourseID,
       c.CourseCode,
       c.CourseName,
       c.CreditUnits,
       c.CourseCategory,
       c.CourseType,
       l.LevelName,
       ca.AssignmentStatus,
       p.ProgrammeName
 FROM dbo.course c
 LEFT JOIN dbo.course_assignment ca ON c.CourseID = ca.CourseID AND ca.LecturerID IS NOT NULL
 LEFT JOIN dbo.levels l ON c.LevelID = l.LevelID
 LEFT JOIN dbo.programmes p ON c.ProgrammeID = p.ProgrammeID
 WHERE ca.AssignmentID IS NULL`;

        // HOD can only see courses related to their department, faculty, or general courses
        if (hodDepartmentID) {
            query += ` AND (c.CourseCategory = 'general' 
                          OR c.FacultyID IN (SELECT FacultyID FROM dbo.appdepartment WHERE DepartmentID = @hodDept) 
                          OR c.DepartmentID = @hodDept)`;
        }
        
        query += ` ORDER BY c.CourseCode`;

        const request = pool.request();
        
        if (hodDepartmentID) {
            request.input('hodDept', sql.Int, hodDepartmentID);
        }

        const result = await request.query(query);
       
return res.status(200).json({
    success: true,
    count: result.recordset.length,
    courses: result.recordset
})



        
    }catch(error){
        return next(errorHandler(500, "Server Error: " + error.message))
    }
}