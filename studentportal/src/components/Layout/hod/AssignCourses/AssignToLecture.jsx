import React, { useEffect, useState } from 'react';
import { Check, Filter, Plus, X, AlertCircle, Info } from 'lucide-react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Select, TextInput, Spinner } from 'flowbite-react'
import Button from '../../../ui/Button';
import { useSelector } from 'react-redux';

const AssignToLecture = ({ selectedSession, selectedSemester, selectedLevel, onAssignmentSuccess }) => {

const [idToAssign, setIdToAssign] = React.useState(null);
const [isModalOpen, setIsModalOpen] = React.useState(false);
const [lecturers, setLecturers] = useState([]);
const [unassignedCourses, setUnassignedCourses] = useState([]);
const [selectedCourses, setSelectedCourses] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [searchTerm, setSearchTerm] = useState('');
const [orderBy, setOrderBy] = useState('');
const [assigning, setAssigning] = useState(false);
const [courseSearchTerm, setCourseSearchTerm] = useState('');

const[selectedLecturer, setSelectedLecturer] = React.useState(null);


const [successMessage, setSuccessMessage] = React.useState('');
const [errorMessage, setErrorMessage] = React.useState('');

const hodId = useSelector((state) => state.user.department);

const MAX_UNITS = 12; // Maximum units per lecturer

// Fetch lecturers from API
useEffect(() => {
  fetchLecturers();
}, [searchTerm, orderBy]);

// Fetch unassigned courses
useEffect(() => {
  fetchUnassignedCourses();
}, [selectedSession, selectedSemester, selectedLevel]);

const fetchLecturers = async () => {
  try {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (orderBy) params.append('orderBy', orderBy);

    const response = await fetch(`/api/hod/lecturers/getlecturers?${params}`, {
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Transform data to match  component structure
      const transformedLecturers = data.lecturers.map(lecturer => ({
        id: lecturer.LecturerID,
        firstname: lecturer.OtherNames.split(' ')[0],
        lastname: lecturer.LastName,
        email: lecturer.Email,
        unitsAssigned: lecturer.TotalUnitsAssigned || 0,
        maxUnits: MAX_UNITS,
        courses: lecturer.AssignedCourses ? lecturer.AssignedCourses.split(', ') : [],
      }));
      setLecturers(transformedLecturers);
    } else {
      setError(data.message);
    }
  } catch (err) {
    setError('Failed to fetch lecturers: ' + err.message);
  } finally {
    setLoading(false);
  }
};

const fetchUnassignedCourses = async () => {
  try {
    const response = await fetch(`/api/hod/courses/unassignedcourses/${hodId}`, {
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success) {
      setUnassignedCourses(data.courses);
    }
  } catch (err) {
    console.error('Failed to fetch unassigned courses:', err);
  }
};

const handleAssignCourse = async () => {
  if (selectedCourses.length === 0 || !idToAssign) return;

  try {
    setAssigning(true);
    const assignmentPromises = selectedCourses.map(courseID => 
      fetch('/api/hod/lecturers/assigncourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          courseID,
          lecturerID: idToAssign,
          semesterID: selectedSemester,
          sessionID: selectedSession,
          programmeID: 1 // You may need to make this dynamic
        })
      })
    );

    const responses = await Promise.all(assignmentPromises);
    const results = await Promise.all(responses.map(r => r.json()));

    const allSuccess = results.every(r => r.success);
    
    if (allSuccess) {
      alert('Course(s) assigned successfully!');
      setSelectedCourses([]);
      handleCloseModal();
      fetchLecturers();
      fetchUnassignedCourses();
      if (onAssignmentSuccess) onAssignmentSuccess();
    } else {
      alert('Some assignments failed. Please try again.');
    }
  } catch (err) {
    alert('Failed to assign course: ' + err.message);
  } finally {
    setAssigning(false);
  }
};

const handleUnassignCourse = async (lecturerID, courseCode) => {
  if (!confirm(`Are you sure you want to unassign ${courseCode}?`)) return;

  try {
    const response = await fetch('/api/hod/lecturers/unassigncourse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        lecturerID,
        courseCode
      })
    });

    const data = await response.json();

    if (data.success) {
      alert('Course unassigned successfully!');
      fetchLecturers();
      fetchUnassignedCourses();
      if (onAssignmentSuccess) onAssignmentSuccess();
    } else {
      alert('Failed to unassign course: ' + data.message);
    }

  } catch (err) {
    alert('Failed to unassign course: ' + err.message);
  }
};

const handleCourseSelection = (courseID) => {
  setSelectedCourses(prev => 
    prev.includes(courseID) 
      ? prev.filter(id => id !== courseID)
      : [...prev, courseID]
  );
};


// Helper function to calculate workload status
const getWorkloadStatus = (current, max) => {
  const percentage = (current / max) * 100;
  if (percentage >= 100) return { color: 'bg-red-500', status: 'full', textColor: 'text-red-600' };
  if (percentage >= 80) return { color: 'bg-amber-500', status: 'high', textColor: 'text-amber-600' };
  if (percentage >= 50) return { color: 'bg-blue-500', status: 'medium', textColor: 'text-blue-600' };
  return { color: 'bg-green-500', status: 'low', textColor: 'text-green-600' };
};


const handleOpenModal = (lecturerId, isDisabled) => {
  if (isDisabled) return; // Prevent opening modal for full capacity lecturers
  setIdToAssign(lecturerId);
  setIsModalOpen(true);

  const lecturer = lecturers.find(lect => lect.id === lecturerId);

  setSelectedLecturer(lecturer);
 

}

const handleCloseModal = () => {
  setIdToAssign(null);
  setIsModalOpen(false);
}

  return (
    <div className='border border-slate-200 bg-white p-4 rounded-lg shadow-lg w-full '>

      {/* Error Display */}
      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2'>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* header part with search */}
        <div className='flex items-center justify-between pb-2 border-b-2 border-blue-800/30 '> 
     <div className='flex items-center gap-2  my-2'> 
     <span className='bg-green-400 rounded-full w-2 h-2'> </span>
        <h1 className='font-bold'> Department Lecturers</h1> 
     </div>

     
     <div className='flex items-center gap-3 ' >
       <TextInput
        placeholder="Search lecturers..." 
        className='w-60'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        />  
        <div className='w-40'>
          <Select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
            <option value="">Order by units</option>
            <option value="asc">Least Units</option>
            <option value="desc">Most Units</option>
            </Select> </div> </div>

     </div>

     {/* lecturer card list */}
      <div className='flex gap-5 flex-wrap  mt-4 max-h-[500px] overflow-y-auto '>
      {loading ? (
        <div className='flex justify-center items-center w-full h-40'>
          <Spinner size='xl' />
          <span className='ml-3'>Loading lecturers...</span>
        </div>
      ) : lecturers.length === 0 ? (
        <div className='flex justify-center items-center w-full h-40 text-gray-500'>
          No lecturers found
        </div>
      ) : (
      lecturers.map((lecturer, index) => {
        const workloadStatus = getWorkloadStatus(lecturer.unitsAssigned, lecturer.maxUnits);
        const isAtCapacity = lecturer.unitsAssigned >= lecturer.maxUnits;
        const workloadPercentage = (lecturer.unitsAssigned / lecturer.maxUnits) * 100;

        return (
        <div 
          key={index} 
          className={`flex flex-col w-sm mb-4 p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-sm transition-all
            ${isAtCapacity 
              ? 'opacity-60 cursor-not-allowed' 
              : 'hover:bg-blue-700 hover:text-white cursor-pointer'
            }`}
        >
        
        {/* name and add courses button */}
         <div className='flex items-center justify-between mb-2'>
          <div className='flex gap-2 items-center mb-2'> 
          <span className='bg-purple-600 text-sm  rounded-full text-white font-bold w-10 h-10 flex items-center justify-center'>{(lecturer.firstname).charAt(0) + (lecturer.lastname).charAt(0)}</span>  
         
          <div> 
            <h1 className='font-semibold'> {lecturer.firstname} {lecturer.lastname}</h1> 
            {isAtCapacity && <p className='text-xs text-red-600 font-medium'>At Full Capacity</p>}
          </div>
          </div> 
   
  {/* control modal */}
          <button
           className={`flex items-center justify-center w-8 h-8 rounded-full transition-all
             ${isAtCapacity 
               ? 'bg-gray-200 border border-gray-300 text-gray-400 cursor-not-allowed' 
               : 'bg-blue-100 border border-blue-200 text-green-500 hover:bg-blue-200'
             }`}
           onClick={() => handleOpenModal(lecturer.id, isAtCapacity)}
           disabled={isAtCapacity}
           title={isAtCapacity ? 'Lecturer at maximum capacity' : 'Assign course'}
          > 
            <Plus size={16} /> 
          </button>
         
        </div> 
         
        {/* workload progress bar */}
        <div className='mb-3'>
          <div className='flex items-center justify-between text-xs mb-1'>
            <span className={workloadStatus.textColor}>Workload</span>
            <span className='font-semibold'>
              {lecturer.unitsAssigned}/{lecturer.maxUnits} Units
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
            <div 
              className={`${workloadStatus.color} h-full rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
            />
          </div>
          {workloadPercentage >= 80 && workloadPercentage < 100 && (
            <p className='flex gap-2 items-center text-xs text-amber-600 mt-1'> <Info size={14} /> Approaching capacity</p>
          )}
        </div>
        <div className=''>  </div>
        {/* assigned courses */}
          <div className='flex flex-wrap items-center gap-2  pb-2'>
            {lecturer.courses.map((course, courseIndex) => (
              <div key={courseIndex} className='flex items-center gap-2 border
               border-gray-300 bg-white px-2 py-1 rounded text-xs'>
                <span className='hover:text-black text-black'> {course}</span>
                 <button 
                   className='bg-red-100 rounded-full text-red-700 hover:bg-red-200 transition-colors'
                   title='Remove course'
                   onClick={() => handleUnassignCourse(lecturer.id, course)}
                 > 
                   <X size={10} /> 
                 </button>
                 </div>
            ))}
          </div>

          {/* Drop course here to assign */}
          <div 
            className={`flex items-center mt-2 justify-center border-2 border-dashed rounded-lg h-8 text-xs transition-all
              ${isAtCapacity 
                ? 'border-gray-200 text-gray-300 bg-gray-50' 
                : 'border-gray-300 text-gray-400 hover:border-green-500 hover:text-white'
              }`}
          >
            {isAtCapacity ? 'Capacity Full' : 'Drop course here to assign'}
          </div>

         </div>
        );
      })
      )}
      </div>
<Modal show={isModalOpen} onClose={handleCloseModal} dismissible className='overflor-y-auto' size='4xl'>
  <ModalHeader > Assign course to Dr. {selectedLecturer ? selectedLecturer.firstname + ' ' + selectedLecturer.lastname : ''}</ModalHeader>

  <ModalBody> 
 <div className='mb-4'> <TextInput
    placeholder='Search course by code or name'
    value={courseSearchTerm}
    onChange={(e) => setCourseSearchTerm(e.target.value)}
 /></div>

    <div className='max-h-96 overflow-y-auto'>
    <table className='w-full'>
      <thead className='sticky top-0 bg-white'>
        <tr className='text-left border-b'>
          <th className='p-2' >Select</th>
          <th className='p-2'> Code </th>
          <th className='p-2'> Name </th>
          <th className='p-2'> Units </th>
          <th className='p-2'>Level</th>
          <th className='p-2'> Type</th>
          <th className='p-2'> Category</th>
        </tr>
      </thead>
      <tbody>
        {unassignedCourses
          .filter(course => 
            course.CourseCode.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
            course.CourseName.toLowerCase().includes(courseSearchTerm.toLowerCase())
          )
          .map((course, index) => (
            <tr key={index} className='border-t hover:bg-gray-50'>
              <td className='p-2'> 
                <input 
                  type='checkbox' 
                  checked={selectedCourses.includes(course.CourseID)}
                  onChange={() => handleCourseSelection(course.CourseID)}
                /> 
              </td>
              <td className='p-2'> {course.CourseCode} </td>
              <td className='p-2'> {course.CourseName} </td>
              <td className='p-2'> {course.CreditUnits} Units </td>
              <td className='p-2'> {course.LevelName} </td>
              <td className='p-2'> {course.CourseType} </td>
              <td className='p-2'> {course.CourseCategory} </td>
            </tr>
          ))
        }
        {unassignedCourses.length === 0 && (
          <tr>
            <td colSpan="7" className='p-4 text-center text-gray-500'>
              No unassigned courses available
            </td>
          </tr>
        )}
      </tbody>
    </table>
    </div>
    
     </ModalBody>

  <ModalFooter> 
    <Button 
      text={assigning ? "Assigning..." : `Assign (${selectedCourses.length})`}
      icon={Check} 
      onClick={handleAssignCourse}
      disabled={assigning || selectedCourses.length === 0}
    /> 
    <Button 
      text="Cancel" 
      onClick={handleCloseModal}
      className='bg-red-400 border border-red-500 hover:bg-red-600' 
      icon={X} 
    />
  </ModalFooter>
</Modal>

    </div>
    
  )
}

export default AssignToLecture