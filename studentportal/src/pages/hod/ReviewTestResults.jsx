import React, { useState, useEffect } from 'react'
import { Select, TextInput, Spinner, Modal, Progress } from 'flowbite-react'
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, FileSpreadsheet, AlertCircle, Download } from 'lucide-react'
import Button from '../../components/ui/Button'

const ReviewTestResults = () => {
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
          courseCode: 'PHS201',
          courseName: 'General Physiology I',
          level: '400L',
          session: '2024/2025',
          semester: 'First',
          lecturerName: 'Dr. Johnson Smith',
          uploadedDate: '2026-01-07',
          deadline: '2026-01-15',
          studentsCount: 45,
          fileName: 'PHS201_CA_Scores.xlsx',
          averageScore: 65.5,
          minScore: 28,
          maxScore: 95
        },
        {
          id: 2,
          courseCode: 'MTH101',
          courseName: 'General Mathematics I',
          level: '100L',
          session: '2024/2025',
          semester: 'First',
          lecturerName: 'Prof. Sarah Williams',
          uploadedDate: '2026-01-08',
          deadline: '2026-01-16',
          studentsCount: 68,
          fileName: 'MTH101_CA_Scores.xlsx',
          averageScore: 58.3,
          minScore: 22,
          maxScore: 88
        },
        {
          id: 3,
          courseCode: 'CSC201',
          courseName: 'Data Structures',
          level: '200L',
          session: '2024/2025',
          semester: 'First',
          lecturerName: 'Dr. Michael Brown',
          uploadedDate: '2026-01-06',
          deadline: '2026-01-14',
          studentsCount: 52,
          fileName: 'CSC201_CA_Scores.xlsx',
          averageScore: 72.1,
          minScore: 35,
          maxScore: 98
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

  const calculateTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const totalDays = 14;
    const percentage = Math.max(0, Math.min(100, (diffDays / totalDays) * 100));
    
    return {
      days: diffDays,
      percentage: percentage,
      isExpired: diffDays < 0,
      isUrgent: diffDays <= 3 && diffDays >= 0
    };
  };

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setShowViewModal(true);
  };

  const handleApprove = async (submissionId) => {
    if (!confirm('Are you sure you want to approve these test results? The lecturer will be able to upload exam results after approval.')) {
      return;
    }

    try {
      setActionLoading(true);
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Test results approved successfully!');
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
      
      alert('Test results rejected. Lecturer will be notified.');
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

  return (
    <div className='flex flex-col gap-4 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-2 mb-4'>
        <h1 className='text-2xl font-bold text-white'>Review Test Results</h1>
        <p className='text-sm text-slate-300'>Review and approve test/CA scores submitted by lecturers</p>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Pending Review</p>
              <p className='text-2xl font-bold text-gray-900'>{filteredSubmissions.length}</p>
            </div>
            <Clock size={32} className='text-amber-500' />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Total Courses</p>
              <p className='text-2xl font-bold text-gray-900'>{submissions.length}</p>
            </div>
            <FileSpreadsheet size={32} className='text-blue-500' />
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
            <CheckCircle size={32} className='text-green-500' />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Urgent Reviews</p>
              <p className='text-2xl font-bold text-red-600'>
                {filteredSubmissions.filter(sub => calculateTimeRemaining(sub.deadline).isUrgent).length}
              </p>
            </div>
            <AlertCircle size={32} className='text-red-500' />
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
          <h2 className='font-semibold text-lg'>Pending Test Results</h2>
          <p className='text-sm text-gray-500'>Review submissions waiting for approval</p>
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
            <p className='text-sm'>All test results have been reviewed</p>
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
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Uploaded</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Time Remaining</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Actions</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredSubmissions.map((submission) => {
                  const timeRemaining = calculateTimeRemaining(submission.deadline);
                  
                  return (
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
                      <td className='px-4 py-4 text-sm text-gray-500'>
                        {new Date(submission.uploadedDate).toLocaleDateString()}
                      </td>
                      <td className='px-4 py-4'>
                        <div className='flex flex-col gap-2 min-w-[150px]'>
                          <div className='flex items-center gap-2'>
                            <Clock size={14} className={
                              timeRemaining.isExpired ? 'text-red-600' :
                              timeRemaining.isUrgent ? 'text-amber-600' : 
                              'text-green-600'
                            } />
                            <span className={`text-xs font-medium ${
                              timeRemaining.isExpired ? 'text-red-600' :
                              timeRemaining.isUrgent ? 'text-amber-600' : 
                              'text-green-600'
                            }`}>
                              {timeRemaining.isExpired 
                                ? 'Expired' 
                                : timeRemaining.isUrgent
                                  ? `${timeRemaining.days} days left!`
                                  : `${timeRemaining.days} days left`
                              }
                            </span>
                          </div>
                          <Progress 
                            progress={timeRemaining.percentage}
                            size="sm"
                            color={
                              timeRemaining.isExpired ? 'red' :
                              timeRemaining.isUrgent ? 'yellow' : 
                              'green'
                            }
                          />
                        </div>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <Modal show={showViewModal} size="3xl" onClose={() => setShowViewModal(false)}>
        <Modal.Header>Test Result Details</Modal.Header>
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

              {/* Statistics */}
              <div className='grid grid-cols-4 gap-4'>
                <div className='text-center p-3 bg-blue-50 rounded-lg'>
                  <p className='text-sm text-blue-600'>Students</p>
                  <p className='text-2xl font-bold text-blue-900'>{selectedSubmission.studentsCount}</p>
                </div>
                <div className='text-center p-3 bg-green-50 rounded-lg'>
                  <p className='text-sm text-green-600'>Average</p>
                  <p className='text-2xl font-bold text-green-900'>{selectedSubmission.averageScore}%</p>
                </div>
                <div className='text-center p-3 bg-amber-50 rounded-lg'>
                  <p className='text-sm text-amber-600'>Min Score</p>
                  <p className='text-2xl font-bold text-amber-900'>{selectedSubmission.minScore}</p>
                </div>
                <div className='text-center p-3 bg-purple-50 rounded-lg'>
                  <p className='text-sm text-purple-600'>Max Score</p>
                  <p className='text-2xl font-bold text-purple-900'>{selectedSubmission.maxScore}</p>
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
                  text="Approve Results"
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

export default ReviewTestResults
