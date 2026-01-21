import { sql, poolPromise } from '../../db.js';
import { errorHandler } from '../../utils/error.js';
import ExcelJS from 'exceljs';

// Generate Excel template with registered students
export const downloadResultTemplate = async (req, res, next) => {
    const { courseId, sessionId, semesterId } = req.query;

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        if (!courseId || !sessionId || !semesterId) {
            return next(errorHandler(400, "Course, Session, and Semester are required"));
        }

        // Get course details and registered students
        const result = await pool.request()
            .input('CourseID', sql.Int, courseId)
            .input('SessionID', sql.Int, sessionId)
            .input('SemesterID', sql.Int, semesterId)
            .query(`
                SELECT 
                    s.StudentID,
                    s.MatricNo,
                    s.LastName,
                    s.OtherNames,
                    c.CourseCode,
                    c.CourseName,
                    c.CreditUnits,
                    ses.SessionName,
                    sem.SemesterName,
                    d.DepartmentName,
                    l.LevelName
                FROM dbo.course_registration cr
                INNER JOIN dbo.student s ON cr.StudentID = s.StudentID
                INNER JOIN dbo.course c ON cr.CourseID = c.CourseID
                LEFT JOIN dbo.sessions ses ON cr.SessionID = ses.SessionID
                LEFT JOIN dbo.semesters sem ON cr.SemesterID = sem.SemesterID
                LEFT JOIN dbo.appdepartment d ON s.DepartmentID = d.DepartmentID
                LEFT JOIN dbo.levels l ON s.LevelID = l.LevelID
                WHERE cr.CourseID = @CourseID
                    AND cr.SessionID = @SessionID
                    AND cr.SemesterID = @SemesterID
                    AND cr.RegistrationStatus = 'registered'
                ORDER BY s.MatricNo
            `);

        if (result.recordset.length === 0) {
            return next(errorHandler(404, "No students registered for this course"));
        }

        const students = result.recordset;
        const courseInfo = students[0]; // Get course info from first record

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Student Results');

        // Set column widths
        worksheet.columns = [
            { header: 'S/N', key: 'sn', width: 8 },
            { header: 'Matric Number', key: 'matricNo', width: 20 },
            { header: 'Name', key: 'Name', width: 50 },
            { header: 'Test Score (30)', key: 'testScore', width: 15 },
            { header: 'Exam Score (70)', key: 'examScore', width: 15 },
            { header: 'Total Score (100)', key: 'totalScore', width: 15 },
            { header: 'Grade', key: 'grade', width: 10 }
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true, size: 12 };
        worksheet.getRow(1).eachCell((cell)=>{
        cell.border={
            bottom: {style:'medium', color: {argb:'FF000000'}}
        }
      })

        worksheet.getRow(1).font = { bold: true, color: { argb: 'FF000000' } };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(1).height = 25;

        // Add course information at the top (insert rows before data)
        worksheet.insertRow(1, ['Course Code:', courseInfo.CourseCode]);
        worksheet.insertRow(2, ['Course Name:', courseInfo.CourseName]);
        worksheet.insertRow(3, ['Session:', courseInfo.SessionName]);
        worksheet.insertRow(4, ['Semester:', courseInfo.SemesterName]);
        worksheet.insertRow(5, ['Credit Units:', courseInfo.CreditUnits]);
        worksheet.insertRow(6, []); // Empty row

        // Style course info rows
        for (let i = 1; i <= 5; i++) {
            worksheet.getRow(i).getCell(1).font = { bold: true };
            worksheet.getRow(i).getCell(2).font = { bold: true, color: { argb: 'FF1E3A8A' } };
        }

        // Add student data starting from row 8 (after course info + empty row + header)
        students.forEach((student, index) => {
            const row = worksheet.addRow({
                sn: index + 1,
                matricNo: student.MatricNo,
                Name: student.LastName + ' ' + student.OtherNames,
                testScore: '',
                examScore: '',
                totalScore: '',
                grade: ''
            });

            // Add formula for total score
            const rowNumber = row.number;
            row.getCell('totalScore').value = {
                formula: `IF(AND(D${rowNumber}<>"",E${rowNumber}<>""),D${rowNumber}+E${rowNumber},"")`
            };

            // Add formula for grade
            row.getCell('grade').value = {
                formula: `IF(F${rowNumber}="","",IF(F${rowNumber}>=70,"A",IF(F${rowNumber}>=60,"B",IF(F${rowNumber}>=50,"C",IF(F${rowNumber}>=45,"D",IF(F${rowNumber}>=40,"E","F"))))))`
            };

            // Add borders
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Alternate row colors
            if (index % 2 === 0) {
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF3F4F6' }
                };
            }
        });

        // Add data validation for test score (0-30)
        const testScoreColumn = worksheet.getColumn('testScore');
        testScoreColumn.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
            if (rowNumber > 7) { // Skip header and course info
                cell.dataValidation = {
                    type: 'decimal',
                    operator: 'between',
                    formulae: [0, 30],
                    showErrorMessage: true,
                    errorTitle: 'Invalid Score',
                    error: 'Test score must be between 0 and 30'
                };
            }
        });

        // Add data validation for exam score (0-70)
        const examScoreColumn = worksheet.getColumn('examScore');
        examScoreColumn.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
            if (rowNumber > 7) {
                cell.dataValidation = {
                    type: 'decimal',
                    operator: 'between',
                    formulae: [0, 70],
                    showErrorMessage: true,
                    errorTitle: 'Invalid Score',
                    error: 'Exam score must be between 0 and 70'
                };
            }
        });

        // Protect worksheet but allow editing score columns
        worksheet.protect('', {
            selectLockedCells: true,
            selectUnlockedCells: true,
            formatCells: false,
            formatColumns: false,
            formatRows: false,
            insertColumns: false,
            insertRows: false,
            deleteColumns: false,
            deleteRows: false
        });

        // Unlock test and exam score columns for editing
        testScoreColumn.eachCell((cell, rowNumber) => {
            if (rowNumber > 7) {
                cell.protection = { locked: false };
            }
        });
        examScoreColumn.eachCell((cell, rowNumber) => {
            if (rowNumber > 7) {
                cell.protection = { locked: false };
            }
        });

        // Generate filename
        const filename = `${courseInfo.CourseCode}_${courseInfo.SessionName.replace('/', '-')}_${courseInfo.SemesterName}_Results.xlsx`;

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error generating template:', error);
        return next(errorHandler(500, "Error generating template: " + error.message));
    }
};

// Upload and process results
export const uploadResults = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(errorHandler(400, "No file uploaded"));
        }

        const { courseId, sessionId, semesterId } = req.query;

        if (!courseId || !sessionId || !semesterId) {
            return next(errorHandler(400, "Course, Session, and Semester are required"));
        }

        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Read uploaded Excel file
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);
        const worksheet = workbook.worksheets[0];

        // Extract course info from the file (rows 1-5)
        const fileSessionName = worksheet.getRow(3).getCell(2).value;
        const fileSemesterName = worksheet.getRow(4).getCell(2).value;

        const results = [];
        const errors = [];
        let successCount = 0;
        let errorCount = 0;

        // Process student data (starts from row 8 after headers)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 7) return; // Skip header rows

            const matricNo = row.getCell(2).value;
            const testScore = row.getCell(5).value;
            const examScore = row.getCell(6).value;
            const totalScore = row.getCell(7).value;
            const grade = row.getCell(8).value;

            // Skip empty rows
            if (!matricNo) return;

            // Validate scores
            if (testScore !== null && testScore !== '' && (testScore < 0 || testScore > 30)) {
                errors.push({ row: rowNumber, matricNo, error: 'Test score must be between 0 and 30' });
                errorCount++;
                return;
            }

            if (examScore !== null && examScore !== '' && (examScore < 0 || examScore > 70)) {
                errors.push({ row: rowNumber, matricNo, error: 'Exam score must be between 0 and 70' });
                errorCount++;
                return;
            }

            // Only process if scores are provided
            if (testScore !== null && testScore !== '' && examScore !== null && examScore !== '') {
                results.push({
                    matricNo,
                    testScore: parseFloat(testScore) || 0,
                    examScore: parseFloat(examScore) || 0,
                    totalScore: parseFloat(totalScore) || 0,
                    grade: grade || ''
                });
            }
        });

        if (results.length === 0) {
            return next(errorHandler(400, "No valid results found in the uploaded file"));
        }

        // Begin transaction
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            for (const result of results) {
                // Get StudentID from MatricNo
                const studentResult = await transaction.request()
                    .input('MatricNo', sql.VarChar, result.matricNo)
                    .query('SELECT StudentID FROM dbo.student WHERE MatricNo = @MatricNo');

                if (studentResult.recordset.length === 0) {
                    errors.push({ matricNo: result.matricNo, error: 'Student not found' });
                    errorCount++;
                    continue;
                }

                const studentId = studentResult.recordset[0].StudentID;

                // Check if result already exists
                const existingResult = await transaction.request()
                    .input('StudentID', sql.Int, studentId)
                    .input('CourseID', sql.Int, courseId)
                    .input('SessionID', sql.Int, sessionId)
                    .input('SemesterID', sql.Int, semesterId)
                    .query(`
                        SELECT ResultID FROM dbo.results 
                        WHERE StudentID = @StudentID 
                            AND CourseID = @CourseID 
                            AND SessionID = @SessionID 
                            AND SemesterID = @SemesterID
                    `);

                if (existingResult.recordset.length > 0) {
                    // Update existing result
                    await transaction.request()
                        .input('ResultID', sql.Int, existingResult.recordset[0].ResultID)
                        .input('TestScore', sql.Decimal(5, 2), result.testScore)
                        .input('ExamScore', sql.Decimal(5, 2), result.examScore)
                        .input('TotalScore', sql.Decimal(5, 2), result.totalScore)
                        .input('Grade', sql.VarChar, result.grade)
                        .query(`
                            UPDATE dbo.results 
                            SET TestScore = @TestScore,
                                ExamScore = @ExamScore,
                                TotalScore = @TotalScore,
                                Grade = @Grade,
                                DateModified = GETDATE()
                            WHERE ResultID = @ResultID
                        `);
                } else {
                    // Insert new result
                    await transaction.request()
                        .input('StudentID', sql.Int, studentId)
                        .input('CourseID', sql.Int, courseId)
                        .input('SessionID', sql.Int, sessionId)
                        .input('SemesterID', sql.Int, semesterId)
                        .input('TestScore', sql.Decimal(5, 2), result.testScore)
                        .input('ExamScore', sql.Decimal(5, 2), result.examScore)
                        .input('TotalScore', sql.Decimal(5, 2), result.totalScore)
                        .input('Grade', sql.VarChar, result.grade)
                        .query(`
                            INSERT INTO dbo.results 
                            (StudentID, CourseID, SessionID, SemesterID, TestScore, ExamScore, TotalScore, Grade, DateCreated)
                            VALUES 
                            (@StudentID, @CourseID, @SessionID, @SemesterID, @TestScore, @ExamScore, @TotalScore, @Grade, GETDATE())
                        `);
                }

                successCount++;
            }

            await transaction.commit();

            res.status(200).json({
                success: true,
                message: "Results uploaded successfully",
                summary: {
                    total: results.length + errorCount,
                    successful: successCount,
                    failed: errorCount
                },
                errors: errors.length > 0 ? errors : undefined
            });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        console.error('Error uploading results:', error);
        return next(errorHandler(500, "Error uploading results: " + error.message));
    }
};
