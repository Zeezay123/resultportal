import {sql, poolPromise} from '../db.js'
import { errorHandler } from '../utils/error.js'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();




export const Signin = async (req, res, next) => {

    const {username, password, role, department} =req.body

    // const username = 'admin user'
    // const password = 'password123'
    // const role = 'admin'
    // const department = 1

    // Senate and SuperAdmin don't require department
    const rolesWithoutDepartment = ['senate', 'superadmin'];
    const requiresDepartment = !rolesWithoutDepartment.includes(role?.toLowerCase());

    if(!username || !password || !role){
        return next(errorHandler(400, "Username, password, and role are required"))
    }

    if(requiresDepartment && !department){
        return next(errorHandler(400, "Department is required for this role"))
    }

   
    if(role === 'advisor' ){
        try{

            const pool = await poolPromise

            if(!pool){
                return next(errorHandler(500, "Database connection failed"))
            }


            const result = await pool.request()
            .input('StaffCode', sql.VarChar, username)
            .input('StaffID', sql.Int, parseInt(password))
            .input('departmentID', sql.Int, parseInt(department))
            .query(`SELECT * FROM Level_Advisors
                 WHERE 
                StaffCode = @StaffCode 
                 AND StaffID = @StaffID
                 AND departmentID = @departmentID`)      
                 
         




            if(result.recordset.length === 0){
                return next(errorHandler(401, "Invalid Credentials"))
            }

            const user = result.recordset[0]
        
            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.StaffCode,
                    role: 'Advisor',
                    departmentID: user.DepartmentID
                }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            )

            // Send response
            return res.status(200)
                .cookie('access_token', token, {  
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                })
                .json({
                    success: true,
                    message: "Signin Successful",
                    user: {
                        id: user.StaffCode,
                        name: user.StaffCode,
                        role: 'Advisor',
                        department: user.DepartmentID
                    },
                    token: token
                })
        }catch(err){
            console.error("Signin error details:", err.message)
            console.error("Full error:", err)
            return next(errorHandler(500, `Server error: ${err.message}`))
        }
    }

    // Senate and SuperAdmin login - no department required
    if(role.toLowerCase() === 'senate' || role.toLowerCase() === 'superadmin'){
        try{
            const pool = await poolPromise
            
            if(!pool){
                return next(errorHandler(500, "Database connection failed"))
            }
            
            const result = await pool.request()
                .input('username', sql.VarChar, username)
                .input('password', sql.VarChar, password)
                .input('Role', sql.VarChar, role)
                .query(`SELECT * FROM appusers 
                    WHERE name = @username 
                    AND password = @password 
                    AND role = @Role
                    AND (departmentID IS NULL OR departmentID = 0)`)
            
            if(result.recordset.length === 0){
                return next(errorHandler(401, "Invalid Credentials"))
            }

            const user = result.recordset[0]
            
            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.name,
                    role: user.Role,
                    departmentID: null  // No department for Senate/SuperAdmin
                }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            )

            console.log('role:', user.Role);
            
            return res.status(200)
                .cookie('access_token', token, {  
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                })
                .json({
                    success: true,
                    message: "Signin Successful",
                    user: {
                        id: user.username,
                        name: user.name,
                        email: user.email,
                        role: user.Role,
                        department: null  // No department
                    },
                    token: token
                })
                
        }catch(err){
            console.error("Signin error details:", err.message)
            console.error("Full error:", err)
            return next(errorHandler(500, `Server error: ${err.message}`))
        }
    }

    if(role === 'student'){
        try {
            
           const pool = await poolPromise
         
        
         
         if(!pool){
             return next(errorHandler(500, "Database connection failed"))
         }
         
         const result = await pool.request()
         .input('MatricNo', sql.VarChar, username)
         .input('StudentID',sql.VarChar, password)
         .input('departmentID', sql.Int, department)
         .query(`SELECT * FROM student
             WHERE MatricNo = @MatricNo 
             AND StudentID = @StudentID 
             AND DepartmentID = @departmentID`) 
    
       
            
            if(result.recordset.length === 0){
                return next(errorHandler(401, "Invalid Credentials"))
            }

            const user = await result.recordset[0]
        
            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.MatricNo,
                    role: 'Student',
                    departmentID: user.departmentID  // Add departmentID to JWT
                }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            )

             console.log('role:', 'Student');
            // Send response matching Redux slice expectations
            res.status(200)
                .cookie('access_token', token, {  
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                })
                .json({
                    success: true,
                    message: "Signin Successful",
                    user: {
                        id: user.MatricNo,
                        name: `${user.LastName} ${user.OtherNames}`,
                        email: user.email,
                        role: 'Student',
                        department: user.departmentID
                    },
                  
                   
                    token: token
                })
 
  


        }catch(err){
            console.error("Signin error details:", err.message)
            console.error("Full error:", err)
            return next(errorHandler(500, `Server error: ${err.message}`))
        }


    }
    try{
         const pool = await poolPromise
         
        
         
         if(!pool){
             return next(errorHandler(500, "Database connection failed"))
         }
         
         const result = await pool.request()
         .input('StaffCode', sql.VarChar, username)
         .input('password',sql.VarChar, password)
         .input('Role', sql.VarChar, role)
         .input('departmentID', sql.Int, department)
         .query('SELECT * FROM appusers WHERE StaffCode = @StaffCode AND password = @password AND role = @role AND departmentID = @departmentID') 
    
       
            
            if(result.recordset.length === 0){
                return next(errorHandler(401, "Invalid Credentials"))
            }

            const user = await result.recordset[0]
        
            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.StaffCode,
                    role: user.role,
                    departmentID: user.departmentID  // Add departmentID to JWT
                }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            )

             console.log('role:', user.Role);
            // Send response matching Redux slice expectations
            res.status(200)
                .cookie('access_token', token, {  
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                })
                .json({
                    success: true,
                    message: "Signin Successful",
                    user: {
                        id: user.StaffCode,
                        name: user.name,
                        email: user.email,
                        role: user.Role,
                        department: user.departmentID
                    },
                  
                   
                    token: token
                })
 
  


        }catch(err){
            console.error("Signin error details:", err.message)
            console.error("Full error:", err)
            return next(errorHandler(500, `Server error: ${err.message}`))
        }

}