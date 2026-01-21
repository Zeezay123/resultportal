import React, { useState, useEffect } from 'react'
import { Select, TextInput, Spinner, Modal, Badge } from 'flowbite-react'
import { Search, Filter, Eye, CheckCircle, XCircle, FileSpreadsheet, TrendingUp, Award, Download } from 'lucide-react'
import Button from '../../components/ui/Button'

const ReviewExamResults = () => {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [selectedSession, selectedSemester, selectedLevel, searchTerm, submissions]);

  const fetchPendingSubmissions = async () => {
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
          lecturerName: 'Prof. Sarah Williams',
          uploadedDate: '2026-01-13',
          studentsCount: 52,
          fileName: 'CSC101_Final_Results.xlsx',
          caStatus: 'Approved',
          caAverage: 22.5,
          examAverage: 45.8,
          totalAverage: 68.3,
          passRate: 85.5,
          gradeDistribution: {
            A: 8,
            B: 15,
            C: 18,
            D: 6,
            E: 3,
            F: 2
          }
        },
        {
          id: 2,
          courseCode: 'MTH201',
          courseName: 'Mathematical Methods',
          level: '200L',
          session: '2024/2025',
          semester: 'First',
          lecturerName: 'Dr. Ahmed Ibrahim',
          uploadedDate: '2026-01-12',
          studentsCount: 45,
          fileName: 'MTH201_Final_Results.xlsx',
          caStatus: 'Approved',
          caAverage: 20.1,
          examAverage: 42.3,
          totalAverage: 62.4,
          passRate: 78.2,
          gradeDistribution: {
            A: 5,
            B: 12,
            C: 15,
            D: 8,
            E: 3,
            F: 2
          }
        },
        {
          id: 3,
          courseCode: 'PHS301',
          courseName: 'Advanced Physiology',
          level: '300L',
          session: '2024/2025',
          semester: 'First',
          lecturerName: 'Dr. Elizabeth Okonkwo',
          uploadedDate: '2026-01-14',
          studentsCount: 38,
          fileName: 'PHS301_Final_Results.xlsx',
          caStatus: 'Approved',
          caAverage: 24.2,
          examAverage: 51.6,
          totalAverage: 75.8,
          passRate: 92.1,
          gradeDistribution: {
            A: 12,
            B: 16,
            C: 7,
            D: 2,
            E: 1,
            F: 0
          }
        }
      ];
      setSubmissions(mockSubmissions);
      setFilteredSubmissions(mockSubmissions);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    if (selectedSession) {
      filtered = filtered.filter(sub => sub.session === selectedSession);
    }
    if (selectedSemester) {
      filtered = filtered.filter(sub => sub.semester === selectedSemester);
    }
    if (selectedLevel) {
      filtered = filtered.filter(sub => sub.level === selectedLevel);
    }
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.lecturerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubmissions(filtered);
  };

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setShowViewModal(true);
  };

  const handleApprove = async (submissionId) => {
    if (!confirm('Are you sure you want to approve these final exam results? This action will finalize the grades for all students.')) {
      return;
    }

    try {
      setActionLoading(true);
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Exam results approved successfully! Student grades have been finalized.');
      fetchPendingSubmissions();
      setShowViewModal(false);
    } catch (err) {
      alert('Failed to approve: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (submissionId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setActionLoading(true);
      // API call would go here with reason
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Exam results rejected. Lecturer will be notified to make corrections.');
      fetchPendingSubmissions();
      setShowViewModal(false);
    } catch (err) {
      alert('Failed to reject: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const downloadFile = (fileName) => {
    alert(`Downloading ${fileName}...`);
  };

  const getPassRateColor = (passRate) => {
    if (passRate >= 80) return 'text-green-600';
    if (passRate >= 60) return 'text-blue-600';
    if (passRate >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className='flex flex-col gap-4 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-2 mb-4'>
        <h1 className='text-2xl font-bold text-white'>Review Exam Results</h1>
        <p className='text-sm text-slate-300'>Review and approve final examination results submitted by lecturers</p>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Pending Review</p>
              <p className='text-2xl font-bold text-gray-900'>{filteredSubmissions.length}</p>
            </div>
            <FileSpreadsheet size={32} className='text-amber-500' />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Total Students</p>
              <p className='text-2xl font-bold text-gray-900'>
                {filteredSubmissions.reduce((sum, sub) => sum + sub.studentsCount, 0)}
              </p>
            </div>
            <Award size={32} className='text-blue-500' />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Avg Pass Rate</p>
              <p className='text-2xl font-bold text-green-600'>
                {filteredSubmissions.length > 0 
                  ? (filteredSubmissions.reduce((sum, sub) => sum + sub.passRate, 0) / filteredSubmissions.length).toFixed(1)
                  : 0}%
              </p>
            </div>
            <TrendingUp size={32} className='text-green-500' />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Avg Total Score</p>
              <p className='text-2xl font-bold text-purple-600'>
                {filteredSubmissions.length > 0 
                  ? (filteredSubmissions.reduce((sum, sub) => sum + sub.totalAverage, 0) / filteredSubmissions.length).toFixed(1)
                  : 0}
              </p>
            </div>
            <CheckCircle size={32} className='text-purple-500' />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white p-4 rounded-lg shadow-sm'>
        <div className='flex items-center gap-2 mb-4'>
          <Filter size={20} />
          <h2 className='font-semibold'>Filters</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
            <option value="">All Sessions</option>
            <option value="2024/2025">2024/2025</option>
            <option value="2023/2024">2023/2024</option>
          </Select>
          <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
            <option value="">All Semesters</option>
            <option value="First">First Semester</option>
            <option value="Second">Second Semester</option>
          </Select>
          <Select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
            <option value="">All Levels</option>
            <option value="100L">100 Level</option>
            <option value="200L">200 Level</option>
            <option value="300L">300 Level</option>
            <option value="400L">400 Level</option>
          </Select>
          <TextInput
            icon={Search}
            placeholder="Search by course or lecturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        <div className='p-4 border-b border-gray-200'>
          <h2 className='font-semibold text-lg'>Pending Exam Results</h2>
          <p className='text-sm text-gray-500'>Review final examination submissions waiting for approval</p>
        </div>

        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <Spinner size='xl' />
            <span className='ml-3 text-gray-600'>Loading submissions...</span>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className='flex flex-col justify-center items-center py-20 text-gray-500'>
            <CheckCircle size={48} className='mb-4 text-gray-300' />
            <p className='text-lg font-medium'>No pending submissions</p>
            <p className='text-sm'>All exam results have been reviewed</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Course</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Lecturer</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Level</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Students</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Avg (CA/Exam/Total)</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Pass Rate</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Uploaded</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Actions</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-4'>
                      <div className='flex flex-col'>
                        <span className='font-medium text-gray-900'>{submission.courseCode}</span>
                        <span className='text-sm text-gray-500'>{submission.courseName}</span>
                      </div>
                    </td>
                    <td className='px-4 py-4 text-sm'>{submission.lecturerName}</td>
                    <td className='px-4 py-4 text-sm'>{submission.level}</td>
                    <td className='px-4 py-4 text-sm'>{submission.studentsCount}</td>
                    <td className='px-4 py-4'>
                      <div className='flex flex-col text-sm'>
                        <span className='text-gray-600'>CA: {submission.caAverage}</span>
                        <span className='text-gray-600'>Exam: {submission.examAverage}</span>
                        <span className='font-medium text-gray-900'>Total: {submission.totalAverage}</span>
                      </div>
                    </td>
                    <td className='px-4 py-4'>
                      <span className={`text-lg font-bold ${getPassRateColor(submission.passRate)}`}>
                        {submission.passRate}%
                      </span>
                    </td>
                    <td className='px-4 py-4 text-sm text-gray-500'>
                      {new Date(submission.uploadedDate).toLocaleDateString()}
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => handleViewDetails(submission)}
                          className='flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors'
                          title='View Details'
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          onClick={() => handleApprove(submission.id)}
                          className='flex items-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg text-sm font-medium transition-colors'
                          title='Approve'
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(submission.id)}
                          className='flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors'
                          title='Reject'
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <Modal show={showViewModal} size="4xl" onClose={() => setShowViewModal(false)}>
        <Modal.Header>Final Exam Result Details</Modal.Header>
        <Modal.Body>
          {selectedSubmission && (
            <div className='space-y-4'>
              {/* Course Information */}
              <div className='grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg'>
                <div>
                  <p className='text-sm text-gray-500'>Course</p>
                  <p className='font-medium'>{selectedSubmission.courseCode} - {selectedSubmission.courseName}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Lecturer</p>
                  <p className='font-medium'>{selectedSubmission.lecturerName}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Level</p>
                  <p className='font-medium'>{selectedSubmission.level}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Session / Semester</p>
                  <p className='font-medium'>{selectedSubmission.session} - {selectedSubmission.semester}</p>
                </div>
              </div>

              {/* Score Statistics */}
              <div className='grid grid-cols-5 gap-3'>
                <div className='text-center p-3 bg-blue-50 rounded-lg'>
                  <p className='text-sm text-blue-600'>Students</p>
                  <p className='text-2xl font-bold text-blue-900'>{selectedSubmission.studentsCount}</p>
                </div>
                <div className='text-center p-3 bg-purple-50 rounded-lg'>
                  <p className='text-sm text-purple-600'>Avg CA</p>
                  <p className='text-2xl font-bold text-purple-900'>{selectedSubmission.caAverage}</p>
                </div>
                <div className='text-center p-3 bg-indigo-50 rounded-lg'>
                  <p className='text-sm text-indigo-600'>Avg Exam</p>
                  <p className='text-2xl font-bold text-indigo-900'>{selectedSubmission.examAverage}</p>
                </div>
                <div className='text-center p-3 bg-amber-50 rounded-lg'>
                  <p className='text-sm text-amber-600'>Avg Total</p>
                  <p className='text-2xl font-bold text-amber-900'>{selectedSubmission.totalAverage}</p>
                </div>
                <div className='text-center p-3 bg-green-50 rounded-lg'>
                  <p className='text-sm text-green-600'>Pass Rate</p>
                  <p className='text-2xl font-bold text-green-900'>{selectedSubmission.passRate}%</p>
                </div>
              </div>

              {/* Grade Distribution */}
              <div className='p-4 bg-gray-50 rounded-lg'>
                <h3 className='font-semibold mb-3'>Grade Distribution</h3>
                <div className='grid grid-cols-6 gap-3'>
                  {Object.entries(selectedSubmission.gradeDistribution).map(([grade, count]) => {
                    const gradeColors = {
                      A: 'bg-green-100 text-green-700 border-green-300',
                      B: 'bg-blue-100 text-blue-700 border-blue-300',
                      C: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                      D: 'bg-orange-100 text-orange-700 border-orange-300',
                      E: 'bg-red-100 text-red-700 border-red-300',
                      F: 'bg-gray-100 text-gray-700 border-gray-300'
                    };
                    
                    return (
                      <div key={grade} className={`text-center p-3 rounded-lg border-2 ${gradeColors[grade]}`}>
                        <p className='text-sm font-medium'>Grade {grade}</p>
                        <p className='text-3xl font-bold'>{count}</p>
                        <p className='text-xs mt-1'>
                          {((count / selectedSubmission.studentsCount) * 100).toFixed(1)}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* File Information */}
              <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <FileSpreadsheet size={24} className='text-blue-600' />
                    <div>
                      <p className='font-medium text-blue-900'>{selectedSubmission.fileName}</p>
                      <p className='text-sm text-blue-600'>
                        Uploaded on {new Date(selectedSubmission.uploadedDate).toLocaleDateString()}
                      </p>
                      <div className='flex items-center gap-2 mt-1'>
                        <span className='bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium border border-green-300'>
                          CA Approved ✓
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    text="Download" 
                    icon={Download}
                    onClick={() => downloadFile(selectedSubmission.fileName)}
                    className='bg-blue-600 hover:bg-blue-700'
                  />
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-3 pt-4 border-t'>
                <Button 
                  text="Approve Final Results"
                  icon={CheckCircle}
                  onClick={() => handleApprove(selectedSubmission.id)}
                  disabled={actionLoading}
                  className='bg-green-600 hover:bg-green-700 flex-1'
                />
                <Button 
                  text="Reject Results"
                  icon={XCircle}
                  onClick={() => handleReject(selectedSubmission.id)}
                  disabled={actionLoading}
                  className='bg-red-600 hover:bg-red-700 flex-1'
                />
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default ReviewExamResults
