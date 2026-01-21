import React, { useState, useEffect } from 'react'
import { Select, FileInput, Spinner, Badge } from 'flowbite-react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Info, Download } from 'lucide-react'
import Button from '../../components/ui/Button'

const ExamResults = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvedCACourses, setApprovedCACourses] = useState([]);

  useEffect(() => {
    fetchApprovedCAResults();
    fetchSubmissions();
  }, []);

  const fetchApprovedCAResults = async () => {
    try {
      // Mock data - only courses with approved CA can have exam uploaded
      const mockApprovedCA = [
        { id: 1, code: 'CSC101', name: 'Introduction to Computer Science', level: '100L', studentsCount: 52 },
        { id: 2, code: 'PHS201', name: 'General Physiology I', level: '400L', studentsCount: 45 }
      ];
      setApprovedCACourses(mockApprovedCA);
    } catch (err) {
      console.error('Failed to fetch approved CA results:', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockSubmissions = [
        {
          id: 1,
          courseCode: 'CSC101',
          courseName: 'Introduction to Computer Science',
          level: '100L',
          session: '2024/2025',
          semester: 'First',
          uploadedDate: '2026-01-12',
          studentsCount: 52,
          status: 'Pending Review',
          fileName: 'CSC101_Final_Results.xlsx',
          caStatus: 'Approved'
        }
      ];
      setSubmissions(mockSubmissions);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
          selectedFile.type !== 'application/vnd.ms-excel') {
        alert('Please upload only Excel files (.xlsx or .xls)');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!selectedCourse || !selectedSession || !selectedSemester || !file) {
      alert('Please fill all fields and select a file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseID', selectedCourse);
      formData.append('sessionID', selectedSession);
      formData.append('semesterID', selectedSemester);
      formData.append('resultType', 'exam');

      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload
      
      alert('Exam results uploaded successfully!');
      setFile(null);
      setSelectedCourse('');
      fetchSubmissions();
    } catch (err) {
      alert('Failed to upload: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending Review': { color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      'Approved': { color: 'bg-green-100 text-green-700 border-green-300' },
      'Rejected': { color: 'bg-red-100 text-red-700 border-red-300' }
    };
    
    const config = statusConfig[status] || statusConfig['Pending Review'];
    
    return (
      <span className={`${config.color} px-3 py-1 rounded-full text-xs font-medium border`}>
        {status}
      </span>
    );
  };

  const downloadTemplate = () => {
    // In production, this would download an actual Excel template with CA scores pre-filled
    alert('Downloading Excel template with CA scores...');
  };

  return (
    <div className='flex flex-col gap-4 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-2 mb-4'>
        <h1 className='text-2xl font-bold text-white'>Upload Exam Results</h1>
        <p className='text-sm text-slate-300'>Upload final examination scores for courses with approved CA results</p>
      </div>

      {/* Info Banner */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <div className='flex items-start gap-3'>
          <Info size={20} className='text-blue-600 mt-0.5' />
          <div>
            <h3 className='font-semibold text-blue-900 mb-1'>Upload Requirements</h3>
            <p className='text-sm text-blue-800'>
              You can only upload exam results for courses where the CA/Test results have been approved by HOD. 
              The exam scores will be combined with the existing CA scores to generate final results.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className='bg-white p-6 rounded-lg shadow-sm'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='font-semibold text-lg'>Upload New Exam Result</h2>
          <Button 
            text="Download Template" 
            icon={Download}
            onClick={downloadTemplate}
            className='bg-blue-600 hover:bg-blue-700'
          />
        </div>

        {approvedCACourses.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
            <AlertCircle size={48} className='mb-4 text-gray-300' />
            <p className='text-lg font-medium'>No courses available</p>
            <p className='text-sm'>You need approved CA results before uploading exam scores</p>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium'>Course (with Approved CA)</label>
                <Select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                  <option value="">Select Course</option>
                  {approvedCACourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name} ({course.studentsCount} students)
                    </option>
                  ))}
                </Select>
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium'>Session</label>
                <Select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
                  <option value="">Select Session</option>
                  <option value="1">2024/2025</option>
                  <option value="2">2023/2024</option>
                </Select>
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium'>Semester</label>
                <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                  <option value="">Select Semester</option>
                  <option value="1">First Semester</option>
                  <option value="2">Second Semester</option>
                </Select>
              </div>
            </div>

            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium'>Upload Excel File</label>
                <FileInput
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  helperText="Upload Excel file with Exam scores (.xlsx or .xls format)"
                />
                {file && (
                  <div className='flex items-center gap-2 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                    <FileSpreadsheet size={20} className='text-blue-600' />
                    <span className='text-sm font-medium text-blue-900'>{file.name}</span>
                    <span className='text-xs text-blue-600'>({(file.size / 1024).toFixed(2)} KB)</span>
                  </div>
                )}
              </div>

              <div className='flex gap-3'>
                <Button 
                  text={uploading ? "Uploading..." : "Upload Results"}
                  icon={Upload}
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className='bg-green-600 hover:bg-green-700'
                />
                {file && (
                  <Button 
                    text="Cancel"
                    onClick={() => setFile(null)}
                    className='bg-gray-500 hover:bg-gray-600'
                  />
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className='mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg'>
              <div className='flex items-start gap-3'>
                <AlertCircle size={20} className='text-amber-600 mt-0.5' />
                <div>
                  <h3 className='font-semibold text-amber-900 mb-2'>Important Instructions:</h3>
                  <ul className='text-sm text-amber-800 space-y-1 list-disc list-inside'>
                    <li>Download the template - it includes student data and existing CA scores</li>
                    <li>Only fill in the EXAM SCORE column (do not modify CA SCORE)</li>
                    <li>The system will automatically calculate TOTAL = CA SCORE + EXAM SCORE</li>
                    <li>Ensure all student matric numbers match the CA results</li>
                    <li>Exam scores should be out of the maximum exam score (typically 70 marks)</li>
                    <li>Double-check all scores before uploading - changes require HOD approval</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Submissions Table */}
      <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        <div className='p-4 border-b border-gray-200'>
          <h2 className='font-semibold text-lg'>Your Submissions</h2>
          <p className='text-sm text-gray-500'>Track your uploaded exam results</p>
        </div>

        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <Spinner size='xl' />
            <span className='ml-3 text-gray-600'>Loading submissions...</span>
          </div>
        ) : submissions.length === 0 ? (
          <div className='flex flex-col justify-center items-center py-20 text-gray-500'>
            <FileSpreadsheet size={48} className='mb-4 text-gray-300' />
            <p className='text-lg font-medium'>No submissions yet</p>
            <p className='text-sm'>Upload your first exam result above</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Course</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Level</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Students</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Uploaded</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>CA Status</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Status</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Actions</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {submissions.map((submission) => (
                  <tr key={submission.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-4'>
                      <div className='flex flex-col'>
                        <span className='font-medium text-gray-900'>{submission.courseCode}</span>
                        <span className='text-sm text-gray-500'>{submission.courseName}</span>
                      </div>
                    </td>
                    <td className='px-4 py-4 text-sm'>{submission.level}</td>
                    <td className='px-4 py-4 text-sm'>{submission.studentsCount}</td>
                    <td className='px-4 py-4 text-sm text-gray-500'>
                      {new Date(submission.uploadedDate).toLocaleDateString()}
                    </td>
                    <td className='px-4 py-4'>
                      {getStatusBadge(submission.caStatus)}
                    </td>
                    <td className='px-4 py-4'>{getStatusBadge(submission.status)}</td>
                    <td className='px-4 py-4'>
                      <div className='flex items-center gap-2'>
                        <button
                          className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                          title='View Details'
                        >
                          View
                        </button>
                        {submission.status === 'Rejected' && (
                          <button
                            className='text-green-600 hover:text-green-800 text-sm font-medium'
                            title='Re-upload'
                          >
                            Re-upload
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExamResults
