import React from 'react'
import { Select, Label, Button,} from "flowbite-react";
import { useEffect, useState } from 'react';



const AssignCourseParams = ({}) => {

const [levels, setLevels] = useState([])
const [selectedLevel, setSelectedLevel] = useState('')
const [courses, setCourses] = useState([])
const [selectedCourse, setSelectedCourse] = useState('')
const [programmes, setProgrammes] = useState([])
const [selectedProgramme, setSelectedProgramme] = useState('')
const [deparments, setDepartments] = useState([])
const [selectedDepartment, setSelectedDepartment] = useState('')
const [lecturers, setLecturers] = useState([])
const [selectedLecturer, setSelectedLecturer] = useState('')


useEffect(()=>{
fetchLevels()
fetchProgramme()
}, [])

useEffect(()=>{
if(selectedLevel){
    handleChangeLevel()
    
}

}, [selectedLevel])

const fetchLevels = async ()=>{
    try {
        const response = await fetch(`/api/levels/getlevels`, {credentials:'include'})

        if(!response.ok){
            console.log('error fetching levels',response.statusText)
            return 
        }
         
        const data = await response.json()
        console.log('levels', data)
        setLevels(data.levels || [])


    } catch (error) {
        console.log("Can't get Levels", error.message)
    }
}


  const handleAssignCourse = async () => {
  

    try {
 
     const res = await    fetch("/api/hod/lecturers/assigncourse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            courseID: selectedCourse,
            lecturerID: selectedLecturer,
            AssignedprogrammeID: selectedProgramme,
            AssignedDepartmentID: selectedDepartment
          }),
        })


      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to assign course");
      }


      alert("Course assigned successfully!");
      setSelectedCourse('')
      setSelectedDepartment('')
      setSelectedLevel('')
      setSelectedProgramme('')
      setSelectedLecturer('')

      

 
    } catch (err) {
      alert("Failed to assign course: " + err.message);
    }
  };


const handleChangeLevel =async()=>{
try {

    const res = await fetch(`/api/hod/courses/unassignedcourses?levelID=${selectedLevel}`,{credentials:'include'})

    if(!res.ok){
        console.log('error fetching unassigned courses', res.statusText)
        return 
    }

    const data = await res.json()
    console.log('unassigned courses', data.courses)
    setCourses(data.courses || [])
} catch (error) {
    console.log('error changing level', error.message)
}
  
} 

const fetchProgramme = async ()=>{
    const res = await fetch(`/api/programmes/`, {credentials:'include'})

    if(!res.ok){

        console.log('error fetching data', res.statusText)
    return
    } 

    const data = await res.json()
   
    setProgrammes(data.programmes || [])
}



const fetchDepartments = async ()=>{
    if(!selectedCourse) return;

    const res = await fetch(`/api/hod/courses/coursedepartment/${selectedCourse}`, {credentials:'include'})

    if(!res.ok){
        console.log('error fetching departments', res.statusText)
        return
    }

    const data = await res.json()
    setDepartments(data.departments || [])

    console.log('departments', data.departments)
}

const fetchlecturers = async ()=>{
    if(!selectedDepartment) return;

    const res = await fetch(`/api/hod/lecturers/lecturerdepartments/${selectedDepartment}`, {credentials:'include'})
    
    if(!res.ok){
        console.log('error fetching lecturers', res.statusText)
        return
    }

    const data = await res.json()
    console.log('lecturers', data.lecturers)
    setLecturers(data.lecturers || [])

}

useEffect(()=>{
    fetchDepartments()
}, [selectedCourse])

useEffect(()=>{
    fetchlecturers()
}, [selectedDepartment])

console.log('selected level', selectedLevel)
console.log('selected course', selectedCourse)
  return (
    <div>
        {/* Assignment part  */}
  <div className="flex flex-col"> 
    
    <div className="w-full pb-5 border-b border-slate-200 flex items-center justify-between">

<div> 

  <h1 className="font-semibold "> New course assignment </h1>    
  <p className="text-sm text-gray-600">Assign a course to a lecturer based on Level, Department and Programme</p>
    </div> 
        <Button onClick={handleAssignCourse} disabled={!selectedCourse || !selectedLevel || !selectedDepartment || !selectedProgramme || !selectedLecturer}>Assign Lecturer</Button>
   </div>

    
    <div className="flex mt-5 gap-4"> 
     

   <div>
    <Label htmlFor="level" > <span className="text-sm "> Select Level </span>  </Label>
     <Select className="w-30 mt-2" sizing="sm" onChange={(e)=> setSelectedLevel(e.target.value)}>
     <option value="">Select Level</option>
     {levels.length > 0 &&  levels.map((level)=>(
        <option value={level.LevelID} key={level.LevelName}>{level.LevelName}</option>
     ))}
     </Select>
    </div> 

    
   <div>
    <Label htmlFor="course" className="mb-2"> <span className="text-sm "> Select Course </span>  </Label>
     <Select className="w-60 mt-2" sizing="sm" 
     disabled={!selectedLevel}
     onChange={(e)=>setSelectedCourse(e.target.value)}
    >
    <option value=''>Select Course to assign </option>

    {courses.length > 0 && courses.map((course)=>(
        <option value={course.CourseID}>{course.CourseName} </option>
    )) }

     </Select>
    </div> 
      

   <div>
    <Label htmlFor="programme" className="mb-2"> <span className="text-sm "> Select Programme </span>  </Label>
     <Select className="w-60 mt-2" sizing="sm" 
     disabled={!selectedCourse}
     onChange={(e)=>setSelectedProgramme(e.target.value)}
     >
        <option value="">Select Programme</option>
        {programmes.length > 0 && programmes.map((programme)=>(
            <option value={programme.ProgrammeID} key={programme.ProgrammeID}>{programme.ProgrammeName}</option>
        ))}
     </Select>
    </div> 
      

   <div>
    <Label htmlFor="department" className="mb-2"> <span className="text-sm "> Select Department </span>  </Label>
     <Select className="w-60 mt-2" sizing="sm"  disabled={!selectedCourse}
     onChange={(e)=>setSelectedDepartment(e.target.value)}
     >
        <option value="">Select Department</option>
        {deparments.length > 0 && deparments.map((dept)=>(
            <option value={dept.DepartmentID} key={dept.DepartmentID}>{dept.DepartmentName}</option>
        ))}
     </Select>
    </div> 
      

   <div>
    <Label htmlFor="course" className="mb-2"> <span className="text-sm "> Select lecturer to assign </span>  </Label>
     <Select className="w-60 mt-2" sizing="sm"  
     disabled={!selectedDepartment}
     onChange={(e)=>setSelectedLecturer(e.target.value)}
     >
     <option value="">Select Lecturer</option> 

     {lecturers.length > 0 && lecturers.map((lecturer)=>(
        <option value={lecturer.StaffID} key={lecturer.StaffID}>{lecturer.FullName}</option>
     ))}
     </Select>
    </div> 
      

    

</div>
 </div>
    </div>
  )
}

export default AssignCourseParams