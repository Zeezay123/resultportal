import React, { useState,useRef, useContext,useEffect } from 'react'
import { lazy } from 'react';
import logo from '../../assets/delsulogo.png'
import sideBarData from '../data/SidebarData';
import { ExpandContext } from '../../pages/hod/Dashboard.jsx'
import { LayoutDashboard, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';





const SidebarComp = () => {
const {expanded} = useContext(ExpandContext)

//location
const location = useLocation();
const [tab, setTab] = useState('')

//turning sidebar on and off
const [turnChev, setTurnChev]= useState(null)  
const dropdownRefs = useRef({})


const activeStyles = {
background: "#487FFF", 
color: "white",
}





useEffect(() => {
  const urlParams = new URLSearchParams(location.search)
  const tabFromUrl = urlParams.get('tab')

if(tabFromUrl)
{
  setTab(tabFromUrl)
}
}, [location.search])




const logoItems = sideBarData.logoItems
const mainItems = sideBarData.mainItems
const bottomSide = sideBarData.bottomSide


const handleTogle=(item)=>{
  setTurnChev((prev)=>(item === prev ? null : item))
}

const capital=(text)=>{

const first = text.charAt(0).toUpperCase()
const last = text.slice(1)


return first + last


}



  return (
   
    <div className={`flex flex-col ${expanded ? 'w-18 items-center':'min-w-64  '}  h-screen justify-between `}>
      <div className=''>
    <header className={`${expanded ? 'justtify-start items-start pl-5':'justify-center '} flex flex-col p-2 max-w-52 gap-2 items-center  `}>
    
    <div className={`drop-shadow-sm ${expanded ? 'w-7 h-8':'w-18 h-20'}  object-cover`}> <img src={logoItems.image} alt=""  className='w-full h-full'/> </div>
  <div className={`${expanded ? 'hidden' : ' flex'} w-full px-2 flex-col items-center justify-center`}>  <h1 className='font-[inter] font-bold text-sm'>{logoItems.main} </h1> 
    <h5 className='font-[inter] text-xs text-slate-700 font-normal'> {logoItems.sub}</h5></div> 

    </header>
    
    <main className={`flex flex-col ${expanded ? 'gap-0':'gap-5' }   justify-between w-full py-2 px-3`}>
    
    {mainItems.map((header,index)=>(
     <div key={index} className='flex flex-col  w-full cursor-default'> 
   { expanded ? <></>:(<h4 className='text-slate-600 font-medium font-[inter] text-xs p-2 '>{header.title} </h4> )}
     {header.items.map((item,index)=>(

      <div key={index} className='flex flex-col'> 
      <NavLink key={index} to={`/?tab=${item.name}`}  className={`flex justify-between  h-8 rounded-md px-2 gap-2 items-center ${item.name === tab ? 'bg-blue-600 text-white' : ' bg-white'} 
       hover:text-white hover:bg-blue-600 text-black`} 
       onClick={()=>handleTogle(item.name)}
       >
        
      <div className={`${expanded ? '' :'flex flex-row gap-2 items-center cursor-pointer'}`}>
       
       
        <div> <item.icon size={16}/>   </div>
       { !expanded &&  <h2 className={`text-sm font-medium font-[inter]` }> 
          {item.name} </h2>}
        

        {/* {item.badge && <span className={`bg-blue-700 rounded-full w-4 h-4 text-white 
         flex justify-center items-center text-[11px] font-[inter] font-bold`} >
          {item.badge}</span>}  */}
          </div>
         { !expanded && item.items.length > 0 ? 
          
         (<div>{ turnChev === item.name ? (<ChevronRight size={16} />) : (<ChevronDown size={16} />)} </div>) : ('')}
         
         
        </NavLink> 

      
  <div  
  ref={(e)=> dropdownRefs.current[item.name] = e}

  style={{
    maxHeight: turnChev === item.name ? `${dropdownRefs.current[item.name]?.scrollHeight}px`:'0px',
    opacity: turnChev === item.name ? 1 : 0

  }}

  className={`border-l-[1px] border-slate-200 overflow-hidden w-[85%] mx-auto transition-all duration-1000 ease-in-out`}>
   { expanded ? <></>:  item.items.map((drop,index)=>(
   
        <NavLink to={`${drop.name == 'Overview' ? `/?tab=Dashboard`:`/?tab=${drop.name}`} `} className='flex items-center mx-4 my-1 gap-2   rounded-lg px-2 py-1 hover:bg-blue-50' key={index}>
        <div > <drop.icon size={14}/> </div>
         <h5 className='text-sm text-slate-700 font-[inter] font-medium'>{drop.name}</h5></NavLink>
)) }
  </div>

  
 
      </div>
     ))}
      </div> 
    ))}


    </main>
    </div>
    <footer className='flex py-2 px-4 gap-2 font-[inter] mb-5'>
      <div className={`flex ${expanded ? 'w-8 h-8':'w-11 h-11 ' } border-2
      justify-center items-center rounded-full object-cover`}> <img src={bottomSide.image} alt="" className='w-full h-full rounded-full'  /> </div>
      
      <div className={`${expanded ? 'hidden' : 'block'}`}>
        <h4 className='font-bold text-sm '>{capital(bottomSide.username)}</h4>
        <h5 className='font-medium text-xs text-slate-500'>{bottomSide.email}</h5>
      </div>

    </footer>

    </div>
  
  );
}


export default SidebarComp