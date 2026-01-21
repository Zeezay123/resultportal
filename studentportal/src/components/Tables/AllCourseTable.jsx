import React,{useState, useEffect} from 'react'
import {  Checkbox, Popover, Select, Spinner, TextInput } from 'flowbite-react'
import { Filter, Info, Plus, PlusCircle, Search } from 'lucide-react'
import Button from '../ui/Button'
import { useSelector } from 'react-redux'


const AllCourseTable = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedTerm, setDebouncedTerm] = useState(searchTerm)
    const [courseCategory, setCourseCategory] = useState('')
    const [courseType, setCourseType] = useState('')
    const [programmeID, setProgrammeID] = useState('')
    const [assignmentStatus, setAssignmentStatus] = useState('all')
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [limit, setLimit] = useState(10)
    const [page, setPage] = useState(1)
    const [offset, setOffset] = useState(0)

   const courseLength = ''
    
    const HodID = useSelector((state) => state.user.department);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedTerm(searchTerm)
        }, 1000); // 1 second debounce
        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // Fetch courses whenever filters change
    useEffect(() => {
        fetchCourses();
    }, [debouncedTerm, courseCategory, courseType, programmeID, assignmentStatus, limit, page]);

    const fetchCourses = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams();
            if (debouncedTerm) params.append('search', debouncedTerm);
            if (courseCategory) params.append('courseCategory', courseCategory);
            if (courseType) params.append('courseType', courseType);
            if (programmeID) params.append('programmeID', programmeID);
            if (assignmentStatus) params.append('assignmentStatus', assignmentStatus);
            params.append('limit', limit);
            params.append('page', page);
            const response = await fetch(`http://localhost:5000/api/hod/courses/getcourses/${HodID}?${params.toString()}`, {
                credentials: 'include' // Include cookies for authentication
            });

            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }

            const data = await response.json();
            console.log("Fetched Courses Data:", data);
            setCourses(data.courses || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };


  return (
    <div className='border  m-4 rounded-lg shadow-sm bg-white border-slate-100 '>
        <header className='border-b m-5 pb-4 mb-6 border-gray-300 '>
           <h1 className='text-sm py-2 font-semibold'>All Courses</h1>
       <div className='flex items-center justify-between w-full'> 
      
      <div className='flex items-center gap-6'>  
         <div className='flex gap-2 items-center'>
            <TextInput
                type='search'
                icon={Search}
                onChange={(e)=>setSearchTerm(e.target.value)}
                placeholder='Search Courses'
                value={searchTerm}
                className='w-70'
                sizing="sm"
               
            /> 
            <Button icon={Search}/>
        </div> 

        <div className=' flex gap-4'> 
        <Select className='w-40' sizing="sm" value={courseCategory} onChange={(e) => setCourseCategory(e.target.value)}>
            <option value=''> Select Category </option>
            <option value='general'> General </option>
            <option value='faculty'> Faculty </option>
            <option value='department'> Department </option>
      
        </Select>

      <div className='flex items-center'>   <Select className='w-40' sizing='sm' value={courseType} onChange={(e) => setCourseType(e.target.value)}>
            <option value=''> Select Type </option>
            <option value='core'> Core </option>
            <option value='elective'> Elective </option>
        </Select>
</div> 

         <div className='flex items-center'> <Select className='w-40' sizing='sm' value={programmeID} onChange={(e) => setProgrammeID(e.target.value)}>
            <option value=''> Select Programme </option>
            <option value='1'> Undergraduate Regular </option>
            <option value='2'> Postgraduate Regular </option>
            <option value='3'> Diploma </option>
            <option value='4'> JUPEB </option>
        </Select> 
      

<div className='mt-1'> 
<Popover  
          trigger="hover"
          content={
            <div className="space-y-2 p-3 ">
              <p className="font-normal text-sm text-gray-900 dark:text-white">
                <span className='font-medium'> Filter by programmes:</span> Undergraduate  <br /> Postgraduate, diploma etc </p>
           
             
            </div>
          }
        >
          <Info size={18} className="ml-2 text-gray-400 " />
        </Popover>
</div>

       {/* end */}
           </div>
        
        </div>
        
        </div>
        <Button icon={PlusCircle} text={'Add Course'}  />
      
</div>

        </header>

    <div className='flex mx-5'> <span className='text-sm font-normal'>Show only:</span>
    
     <div className='flex items-center gap-2 ml-4'>
        <input type='radio' name='assignmentFilter' checked={assignmentStatus === 'all'} onChange={() => setAssignmentStatus('all')} /> 
        <span className='text-sm font-normal'> All</span>
         </div>

      <div className='flex items-center gap-2 ml-4'>
        <input type='radio' name='assignmentFilter' checked={assignmentStatus === 'assigned'} onChange={() => setAssignmentStatus('assigned')} /> 
        <span className='text-sm font-normal'> Courses already assigned to lecturers</span>
         </div>
      <div className='flex items-center gap-2 ml-4'>
        <input type='radio' name='assignmentFilter' checked={assignmentStatus === 'unassigned'} onChange={() => setAssignmentStatus('unassigned')} />
        <span className='text-sm font-normal'> Courses not assigned to lecturer</span>
         </div>
        
        
         </div>

      <table className='w-full text-sm text-left text-gray-500 font-[inter] mt-4 '>
        <thead className='bg-slate-50 border-b w-full border-slate-200 '>
            <tr className='font-light text-xs text-gray-900 '>
                <th className='text-left p-4'> Course Code </th>
                <th className='text-left p-4'> Course Title </th>
                <th className='text-left p-4'> Faculty </th>
                <th className='text-left p-4'> Department </th>
                <th className='text-left p-4'> Level </th>
                <th className='text-left p-4'> Semester </th>
                <th className='text-left p-4'> Session </th> 
                <th className='text-left p-4'> Unit </th>
                <th className='text-left p-4'> Assigned Lecturer </th>
                <th className='text-left p-4'> Assignment Status </th>
                <th className='text-left p-4'> Assigned date </th>
            </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="11" className="text-center p-8">
                <Spinner size="lg" />
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="11" className="text-center p-8 text-red-500">
                Error: {error}
              </td>
            </tr>
          ) : courses.length === 0 ? (
            <tr>
              <td colSpan="11" className="text-center p-8 text-gray-400">
                No courses found
              </td>
            </tr>
          ) : (
            courses.map((course) => (
              <tr key={course.CourseID} className=' border-slate-200 hover:bg-gray-50 text-xs'>
                <td className='p-4 font-medium text-gray-900'>{course.CourseCode}</td>
                <td className='p-4'>{course.CourseName}</td>
                <td className='p-4'>{course.FacultyName || 'All'}</td>
                <td className='p-4'>{course.DepartmentName || 'All'}</td>
                <td className='p-4'>{course.LevelName || '-'}</td>
                <td className='p-4'>{course.SemesterName || '-'}</td>
                <td className='p-4'>{course.SessionName || '-'}</td>
                <td className='p-4'>{course.CreditUnits}</td>
                <td className='p-4'>{course.AssignedLecturer || 'Not assigned'}</td>
                <td className='p-4'>
                  <span className={`px-2 py-1 rounded text-xs ${
                    course.AssignmentStatus === 'assigned'
                      ? 'bg-green-100 text-green-800 font-bold text-[10px]' 
                      : 'bg-red-200 text-red-800 rounded font-bold text-[10px]'
                  }`}>
                    {course.AssignmentStatus || 'Unassigned'}
                  </span>
                </td>
                <td className='p-4'>
                  {course.AssignedDate 
                    ? new Date(course.AssignedDate).toLocaleDateString() 
                    : '-'
                  }
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

   <div className='flex p-4 items-center justify-between' >

    <div className='flex text-gray-500 text-xs ' >Showing 10 of 50 </div>

    <div className=''> </div>
    </div>
    </div>
  )
}

export default AllCourseTable