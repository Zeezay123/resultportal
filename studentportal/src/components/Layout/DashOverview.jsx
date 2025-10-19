import React from 'react'
import { sumaryData,assignData, resultData } from '../data/dashboardCard'
import {Button} from 'flowbite-react'



const DashOverview = () => {
  return (
    <main className='grid grid-rows-1 w-full'>
        <section className='grid md:grid-cols-4 w-full p-4 gap-4 mt-5'>
     {sumaryData.map((data, index)=>(
      <div key={index} className='flex flex-col p-4  rounded-xl gap-6 shadow-sm'> 

      <div className='flex items-center justify-between'>

        <div className='font-[inter] font-medium text-sm  text-gray-900'> {data.name}</div>

        <div className={
          `bg-slate-50 flex items-center justify-center1 p-1 rounded-md
          ${data.name === 'Students' ?
             'text-blue-700' : data.name === 'Lecturer'? 
             'text-red-600' : data.name === 'Results' ? 'text-yellow-400' : 'text-green-600'  }
          `
          } > <data.icon size={18}/> </div>
      </div>

    
     <div className=''>
      <div className='font-bold text-2xl'> {data.number}</div>
      <span className=' text-slate-500 text-sm font-normal'>{data.Comment}</span>
      </div>


       </div>
     )) }
    </section>

   <section className='w-full gap-4 p-4 grid grid-cols-1 md:grid-cols-2 '>
     
     
      <div className='p-8 shadow-sm border-[1px] border-slate-200 grid grid-rows-1 gap-5 rounded-xl '>
      <div className='flex items-center justify-between gap-10  md:min-w-lg '> <div className='font-bold font-[inter]'> {assignData.title}</div> <Button size='sm'> See all </Button> </div>
        <div className='w-full border-b-[1px] border-slate-200'></div>
       {assignData.items.map((data,index)=>(
        <div key={index} className='flex justify-between gap-5'> 
         <div className='flex items-center justify-between  gap-3'>
           <div className='w-8 h-8 shadow rounded-full object-cover'> <img src={data.image} alt=""  className='w-full h-full rounded-full'/></div>
          
          <div className='flex flex-col  justify-center'>
             <h1 className='font-medium font-[inter] text-sm' > {data.name}</h1> 
            <h5 className='font-normal font-inter text-[12px] text-slate-400'> {data.email}</h5>  
           </div>
           </div>
        
        
        
        <div className='font-[inter] font-medium h-7 text-xs px-4 border-[1px] border-slate-300 flex items-center justify-center rounded'>{data.session} </div> </div>
       ))} 
    
    
      </div>


      <div className='p-8 shadow-sm border-[1px] border-slate-200 grid grid-rows-1 gap-5 rounded-xl '>
      <div className='flex items-center justify-between gap-10  md:min-w-lg '> <div className='font-bold font-[inter]'> {assignData.title}</div> <Button size='sm'> See all </Button> </div>
        <div className='w-full border-b-[1px] border-slate-200'></div>
       {resultData.items.map((data,index)=>(
        <div key={index} className='flex justify-between gap-5'> 
         <div className='flex gap-3'>
          
          <div className='flex flex-col  justify-center'>
             <h1 className='font-medium font-[inter] text-sm' > {data.name}</h1> 
            <h5 className={`font-normal font-inter text-[12px] text-slate-400`}> {data.email}</h5>  
           </div>
           </div>
        
        
        
        <div className='bg-yellow-100 flex
         px-3 rounded-md h-fit py-1 text-amber-300 
         font-bold items-center justify-center text-[10px] font-[inter]'>{data.status} </div> </div>
       ))} 
    
    
      </div>
     
    
   </section>

    </main>
  )
}

export default DashOverview