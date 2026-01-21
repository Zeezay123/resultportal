import { BookCopyIcon, User2 } from 'lucide-react'
import React from 'react'

const DashboardCard = () => {

const cardData = [
    {
        title: 'Total Courses Assigned',
        value: 10,
        icon: BookCopyIcon,
        comment: 'Courses assigned to you this semester',
    },

      {
        title: 'Total Courses Assigned',
        value: 10,
        icon: BookCopyIcon,
        comment: 'Courses assigned to you this semester',
    },

      {
        title: 'Total Courses Assigned',
        value: 10,
        icon: BookCopyIcon,
        comment: 'Courses assigned to you this semester',
    },
      {
        title: 'Total Courses Assigned',
        value: 10,
        icon: BookCopyIcon,
        comment: 'Courses assigned to you this semester',
    }
]



  return (
    <div className=' mt-6 mb-10  flex  gap-4'>
    
    
    {/* course assigned card */}
    <div className='w-md bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Total Courses Assigned</h2>
          <span className='bg-blue-100 text-blue-600 rounded-full p-2'> <BookCopyIcon/>  </span> </div> 

        <h1 className='font-bold text-3xl my-4'> 10 </h1>
        <p className='text-sm text-gray-500'> Courses assigned to you this semester </p>
    </div>





    {/* course assigned card */}
    <div className='w-md bg-white  shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Total Number of Students</h2>
          <span className='bg-green-100 text-green-600 rounded-full p-2'> <User2/>  </span> </div> 

        <h1 className='font-bold text-3xl my-4'> 10 </h1>
        <p className='text-sm text-gray-500'> Courses assigned to you this semester </p>
    </div>




    {/* course assigned card */}
    <div className='w-md bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Deaslines Approaching</h2>
          <span className='bg-amber-100 text-amber-600 rounded-full p-2'> <BookCopyIcon/>  </span> </div> 

        <h1 className='font-bold text-3xl my-4'> 10 </h1>
        <p className='text-sm text-gray-500'> Courses assigned to you this semester </p>
    </div>




    {/* course assigned card */}
    <div className='w-md bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Total Courses Assigned</h2>
          <span className='bg-blue-100 text-blue-600 rounded-full p-2'> <BookCopyIcon/>  </span> </div> 

        <h1 className='font-bold text-3xl my-4'> 10 </h1>
        <p className='text-sm text-gray-500'> Courses assigned to you this semester </p>
    </div>


    
    </div>
  )
}

export default DashboardCard