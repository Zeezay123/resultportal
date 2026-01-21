import { count } from 'console';
import {sql, poolPromise} from '../../db.js';
import { errorHandler } from '../../utils/error.js';


export const getStudents = async (req, res, next) => {
    const hodDepartmentID = req.params.id;
  
    try {
        
     const pool = await poolPromise;

     if(!pool){
         return next(errorHandler(500, "Database connection failed"))
     }

     if(!hodDepartmentID){
        return next(errorHandler(400, "HOD Department ID is required"))
     }

        const result = await pool.request()
        .input('hodDept', sql.Int, hodDepartmentID)
        .query(`SELECT s.StudentID, s.LastName, s.OtherNames, s.MatricNo, l.LevelName, d.DepartmentName
                FROM dbo.student s
                LEFT JOIN dbo.levels l ON s.LevelID = l.LevelID
                LEFT JOIN dbo.appdepartment d ON s.DepartmentID = d.DepartmentID
                WHERE s.DepartmentID = @hodDept
                ORDER BY s.LastName ASC`);
                


        res.status(200).json({
            success: true,
            students: result.recordset,
            count : result.recordset.length
        });


    } catch (error) {
        console.error('Error fetching students:', error);
        return next(errorHandler(500, "Error fetching students"));
    }


}