import React, { createContext, useState } from 'react'
import Sidebar from '../components/Layout/Sidebar.jsx'
import Mainbody from '../components/Layout/Mainbody.jsx'
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'


export const  ExpandContext = createContext()


const Dashboard = () => {
   
   const [expanded, setExpanded] = useState(false)

 

  return (
    <main className='flex'>
     <ExpandContext.Provider value={{expanded,setExpanded}} >
      <Sidebar/>
    { tab === 'Dashboard' && <Mainbody/> }
     
      </ExpandContext.Provider> 
       
    
    
    </main>
  )
}

export default Dashboard