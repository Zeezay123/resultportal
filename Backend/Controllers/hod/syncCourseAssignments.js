import { sql, poolPromise } from '../../db.js';

export const syncCourseAssignments = async () => {
    try {
        const pool = await poolPromise;
        
        if (!pool) {
            console.error('Database connection failed during sync');
            return;
        }

        // Insert missing course assignments (courses without assignment entries)
        // Creates entries only for active session - historical data comes from result table
        const query = `
            INSERT INTO dbo.course_assignment (CourseID, AssignmentStatus, AssignedDate, SessionID)
            SELECT 
                c.CourseID,
                'unassigned' as AssignmentStatus,
                NULL as AssignedDate, 
                s.SessionID
            FROM dbo.course c
            CROSS JOIN dbo.sessions s
            LEFT JOIN dbo.course_assignment ca 
                ON c.CourseID = ca.CourseID 
                AND s.SessionID = ca.SessionID
            WHERE ca.CourseID IS NULL
                AND s.isActive = 1
        `;

        const result = await pool.request().query(query);
        
        console.log(`Synced course assignments: ${result.rowsAffected[0]} new entries created`);
        
        return result.rowsAffected[0];
    } catch (error) {
        console.error('Error syncing course assignments:', error);
        throw error;
    }
};
