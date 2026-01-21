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



    if(!username || !password || !role || !department){
        return next(errorHandler(400, "All Fields required"))
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
                    id: user.username,
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