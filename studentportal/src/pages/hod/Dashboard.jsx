import React, { createContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import Mainbody from '../../components/Layout/Mainbody.jsx'
import Sidebar from '../../components/Layout/Sidebar.jsx'
import Submissions from '../../components/Layout/Submissions.jsx'


export const  ExpandContext = createContext()
const Dashboard = () => {
  const [tab, setTab] = useState('') 
  const location = useLocation()

   const [expanded, setExpanded] = useState(false)

 useEffect(()=>{
   const urlparam = new URLSearchParams(location.search)
   const tabUrlParam = urlparam.get('tab') 

   if(tabUrlParam){
    setTab(tabUrlParam)
   }

 },[location.search])

  return (
    <main className='flex'>
     <ExpandContext.Provider value={{expanded,setExpanded}} >
  
      <Sidebar/>
  
        <Mainbody/>
        

     
      </ExpandContext.Provider> 
       
    
    
    </main>
  )
}

export default Dashboard