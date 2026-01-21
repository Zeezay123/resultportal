import React, { createContext, useState } from 'react'
import Sidebar from '../../components/Layout/Sidebar.jsx'
import { ExpandContext } from '../hod/Dashboard.jsx'




const Dashboard = () => {
   
   const [expanded, setExpanded] = useState(false)

 

  return (
    <main className='flex'>
     <ExpandContext.Provider value={{expanded,setExpanded}} >
    <div className='w-[15%]'> <Sidebar/> </div> 
  
     
      </ExpandContext.Provider> 
       
    
    
    </main>
  )
}

export default Dashboard