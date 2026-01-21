import React, { useState, useEffect } from 'react'
import { Select, TextInput, Spinner, Badge, Modal, ModalHeader, ModalBody, ModalFooter } from 'flowbite-react'
import { FileCheck, FileX, ClockAlert, CheckCircle, Search, Filter, Eye, UserCheck, XCircle } from 'lucide-react'
import Button from '../../components/ui/Button'

const ResultsDashboard = () => {
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0
  });
  
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // Fetch results data
  useEffect(() => {
    fetchResults();
  }, [selectedSession, selectedSemester, selectedLevel, statusFilter]);

  // Filter results based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = results.filter(result => 
        result.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.lecturerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResults(filtered);
    } else {
      setFilteredResults(results);
    }
  }, [searchTerm, results]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockResults = [
        {
          id: 1,
          courseCode: 'CSC101',
          courseName: 'Introduction to Computer Science',
          level: '100L',
          semester: 'First',
          session: '2024/2025',
          lecturerName: 'Dr. Grace Eze',
          studentsCount: 45,
          submittedDate: '2024-12-15',
          status: 'Pending'
        },
        {
          id: 2,
          courseCode: 'CSC201',
          courseName: 'Computer Programming I',
          level: '200L',
          semester: 'First',
          session: '2024/2025',
          lecturerName: 'Mr. Peter Oluwole',
          studentsCount: 38,
          submittedDate: '2024-12-14',
          status: 'Approved'
        },
        {
          id: 3,
          courseCode: 'MTH101',
          courseName: 'General Mathematics I',
          level: '100L',
          semester: 'First',
          session: '2024/2025',
          lecturerName: 'Dr. Mary Nwosu',
          studentsCount: 52,
          submittedDate: '2024-12-10',
          status: 'Pending'
        },
        {
          id: 4,
          courseCode: 'CSC301',
          courseName: 'Database Management Systems',
          level: '300L',
          semester: 'First',
          session: '2024/2025',
          lecturerName: 'Prof. James Akinola',
          studentsCount: 30,
          submittedDate: '2024-12-08',
          status: 'Rejected'
        }
      ];

      setResults(mockResults);
      
      // Calculate stats
      const stats = {
        totalSubmissions: mockResults.length,
        pendingApproval: mockResults.filter(r => r.status === 'Pending').length,
        approved: mockResults.filter(r => r.status === 'Approved').length,
        rejected: mockResults.filter(r => r.status === 'Rejected').length
      };
      setStats(stats);
      
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = (result) => {
    setSelectedResult(result);
    setViewModalOpen(true);
  };

  const handleApprove = async (resultId) => {
    if (!confirm('Are you sure you want to approve this result?')) return;
    
    try {
      // API call to approve result
      alert('Result approved successfully!');
      fetchResults();
    } catch (err) {
      alert('Failed to approve result: ' + err.message);
    }
  };

  const handleReject = async (resultId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      // API call to reject result
      alert('Result rejected successfully!');
      fetchResults();
    } catch (err) {
      alert('Failed to reject result: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: ClockAlert },
      'Approved': { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
      'Rejected': { color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;
    
    return (
      <span className={`${config.color} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit border`}>
        <Icon size={14} />
        {status}
      </span>
    );
  };

  return (
    <div className='flex flex-col gap-4 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-2 mb-4'>
        <h1 className='text-2xl font-bold text-white'>Results Management</h1>
        <p className='text-sm text-slate-300'>Review and approve submitted course results</p>
      </div>

      {/* Statistics Cards */}
      <section className='grid md:grid-cols-4 w-full gap-4 mb-6'>
        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>Total Submissions</div>
            <div className='bg-blue-50 flex items-center justify-center p-2 rounded-md text-blue-700'>
              <FileCheck size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{stats.totalSubmissions}</div>
            <span className='text-slate-500 text-sm'>All submissions</span>
          </div>
        </div>

        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>Pending Approval</div>
            <div className='bg-yellow-50 flex items-center justify-center p-2 rounded-md text-yellow-600'>
              <ClockAlert size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{stats.pendingApproval}</div>
            <span className='text-slate-500 text-sm'>Awaiting review</span>
          </div>
        </div>

        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>Approved</div>
            <div className='bg-green-50 flex items-center justify-center p-2 rounded-md text-green-600'>
              <CheckCircle size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{stats.approved}</div>
            <span className='text-slate-500 text-sm'>Successfully approved</span>
          </div>
        </div>

        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>Rejected</div>
            <div className='bg-red-50 flex items-center justify-center p-2 rounded-md text-red-600'>
              <FileX size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{stats.rejected}</div>
            <span className='text-slate-500 text-sm'>Rejected results</span>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <div className='bg-white p-4 rounded-lg shadow-sm'>
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-2'>
            <Filter size={20} className='text-gray-600' />
            <h2 className='font-semibold text-lg'>Filters</h2>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>Session</label>
              <Select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
                <option value="">All Sessions</option>
                <option value="1">2024/2025</option>
                <option value="2">2023/2024</option>
              </Select>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>Semester</label>
              <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                <option value="">All Semesters</option>
                <option value="1">First Semester</option>
                <option value="2">Second Semester</option>
              </Select>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>Level</label>
              <Select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
                <option value="">All Levels</option>
                <option value="1">100 Level</option>
                <option value="2">200 Level</option>
                <option value="3">300 Level</option>
                <option value="4">400 Level</option>
              </Select>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>Status</label>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </Select>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>Search</label>
              <TextInput
                icon={Search}
                placeholder="Course or Lecturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        <div className='p-4 border-b border-gray-200 flex items-center justify-between'>
          <div>
            <h2 className='font-semibold text-lg'>Submitted Results</h2>
            <p className='text-sm text-gray-500'>Showing {filteredResults.length} of {results.length} results</p>
          </div>
        </div>

        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <Spinner size='xl' />
            <span className='ml-3 text-gray-600'>Loading results...</span>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className='flex flex-col justify-center items-center py-20 text-gray-500'>
            <FileCheck size={48} className='mb-4 text-gray-300' />
            <p className='text-lg font-medium'>No results found</p>
            <p className='text-sm'>Try adjusting your filters</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Course</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Level</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Lecturer</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Students</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Submitted</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredResults.map((result) => (
                  <tr key={result.id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-4 py-4'>
                      <div className='flex flex-col'>
                        <span className='font-medium text-gray-900'>{result.courseCode}</span>
                        <span className='text-sm text-gray-500'>{result.courseName}</span>
                      </div>
                    </td>
                    <td className='px-4 py-4 text-sm text-gray-900'>{result.level}</td>
                    <td className='px-4 py-4 text-sm text-gray-900'>{result.lecturerName}</td>
                    <td className='px-4 py-4 text-sm text-gray-900'>{result.studentsCount}</td>
                    <td className='px-4 py-4 text-sm text-gray-500'>{new Date(result.submittedDate).toLocaleDateString()}</td>
                    <td className='px-4 py-4'>{getStatusBadge(result.status)}</td>
                    <td className='px-4 py-4'>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => handleViewResult(result)}
                          className='p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors'
                          title='View Details'
                        >
                          <Eye size={18} />
                        </button>
                        {result.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(result.id)}
                              className='p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors'
                              title='Approve'
                            >
                              <UserCheck size={18} />
                            </button>
                            <button
                              onClick={() => handleReject(result.id)}
                              className='p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors'
                              title='Reject'
                            >
                              <XCircle size={18} />
                            </button>
                          </>
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

      {/* View Result Modal */}
      <Modal show={viewModalOpen} onClose={() => setViewModalOpen(false)} size='4xl'>
        <ModalHeader>Result Details - {selectedResult?.courseCode}</ModalHeader>
        <ModalBody>
          {selectedResult && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-600'>Course</label>
                  <p className='text-base font-semibold'>{selectedResult.courseCode} - {selectedResult.courseName}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>Level</label>
                  <p className='text-base font-semibold'>{selectedResult.level}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>Lecturer</label>
                  <p className='text-base font-semibold'>{selectedResult.lecturerName}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>Total Students</label>
                  <p className='text-base font-semibold'>{selectedResult.studentsCount}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>Submitted Date</label>
                  <p className='text-base font-semibold'>{new Date(selectedResult.submittedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>Status</label>
                  <div className='mt-1'>{getStatusBadge(selectedResult.status)}</div>
                </div>
              </div>

              <div className='border-t pt-4'>
                <h3 className='font-semibold mb-3'>Grade Distribution</h3>
                <div className='grid grid-cols-6 gap-2 text-center'>
                  <div className='bg-green-50 p-3 rounded'>
                    <p className='text-2xl font-bold text-green-700'>8</p>
                    <p className='text-xs text-gray-600'>A</p>
                  </div>
                  <div className='bg-blue-50 p-3 rounded'>
                    <p className='text-2xl font-bold text-blue-700'>12</p>
                    <p className='text-xs text-gray-600'>B</p>
                  </div>
                  <div className='bg-yellow-50 p-3 rounded'>
                    <p className='text-2xl font-bold text-yellow-700'>15</p>
                    <p className='text-xs text-gray-600'>C</p>
                  </div>
                  <div className='bg-orange-50 p-3 rounded'>
                    <p className='text-2xl font-bold text-orange-700'>7</p>
                    <p className='text-xs text-gray-600'>D</p>
                  </div>
                  <div className='bg-red-50 p-3 rounded'>
                    <p className='text-2xl font-bold text-red-700'>2</p>
                    <p className='text-xs text-gray-600'>E</p>
                  </div>
                  <div className='bg-gray-50 p-3 rounded'>
                    <p className='text-2xl font-bold text-gray-700'>1</p>
                    <p className='text-xs text-gray-600'>F</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button text="Close" onClick={() => setViewModalOpen(false)} className='bg-gray-500 hover:bg-gray-600' />
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default ResultsDashboard