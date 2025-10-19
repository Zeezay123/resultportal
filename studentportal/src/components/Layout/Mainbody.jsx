import React from 'react'
import Navbar from './Navbar'
import DashOverview from './DashOverview'
import { NavLink } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import Submissions from './Submissions'


const Mainbody = () => {

  const [tab, setTab] = useState('')
  const location = useLocation()

  const [togg, setTogg] = useState() 
  const handleTogg =(index)=>{
    setTogg((p)=> index == p ? p : index)
  }
  
  useEffect(()=>{
    const urlParams = new URLSearchParams(location.search)
    const tabUrlParam = urlParams.get('tab')
    
    if(tabUrlParam){
      setTab(tabUrlParam)
    }
  },[location.search])


  
  const dashElement = [ 'Overview','Submissions', 'Approvals', 'Notifications']
  const TabRef = useRef({})

  return (
    <main className='flex flex-col m-3 w-full  border-slate-300 shadow rounded-lg '>
    <Navbar/>
    <div className='grid grid-rows-1 place-content-start p-4'>
      
       <h1 className='font-[inter] font-bold text-xl md:text-3xl'>Dashboard</h1>
        
        <div className='grid grid-cols-4 bg-slate-100 py-1 px-3 rounded-lg mt-5'> {dashElement.map((data,index)=>(
          
          <NavLink key={index}
          ref={(e)=> TabRef.current[index]=e}
          onClick={()=>handleTogg(index)}
           to={`${data == 'Overview' ? `/?tab=Dashboard` : `/?tab=${data}` }`}
            className={`font-[inter] flex items-center justify-center p-1 ${togg == index ? `bg-white rounded-lg`:``} font-normal text-sm`}> {data} </NavLink>))
            
            
        }   </div>
     </div>
  { tab === 'Dashboard'  &&  <DashOverview/> }
  { tab === 'Submissions' && <Submissions/> }  
  { tab === 'Approvals' && <Submissions/> }  
  { tab === 'Notifications' && <Submissions/> }  

    </main>
  )
}

export default Mainbody