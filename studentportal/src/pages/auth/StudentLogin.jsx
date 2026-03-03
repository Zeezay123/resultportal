import { Label, TextInput } from 'flowbite-react'
import { Database, User } from 'lucide-react'
import React from 'react'

const Signup = () => {



  return (
    <div className='w-full h-screen flex flex-col  bg-blue-700'>

        <header className='flex justify-between w-full text-slate-100 bg-blue-700  py-3 px-8 h-12 border-b border-slate-400'>
             <div className='flex items-center w-full gap-3'>
                 <span className='text-blue-400 -rotate-20'> <Database /></span> DELSU Result Management System </div>
        

        <div> <span>Help</span> <span></span></div>
        </header>
        
        <div className='grid grid-cols-2 w-full h-full '>
           
           <div className='flex flex-col items-center justify-center bg-blue-700/20 gap-5'>
            
         <div className='flex flex-col gap-2'> 
            <h1 className='text-center text-slate-300 md:text-3xl font-bold'>University Result Portal</h1>  
            <p className='text-center text-slate-50 font-light text-sm '>Please enter your details to sign in.</p>
            </div> 

            <div className='flex bg-slate-100/20 py-1 px-2 rounded-full gap-2 '>
                
                <span className='text-sm font-normal text-white bg-blue-950 py-1 px-5 w-25 flex items-center justify-center rounded-full'>Admin</span> 
                <span className='text-sm font-normal text-white  py-1 px-5 w-25 flex items-center justify-center rounded-full'>Lecturer</span> 
                <span className='text-sm font-normal text-white  py-1 px-5 w-25 flex items-center justify-center rounded-full'>Student</span>  
        
             </div> 


            {/* Form Section */}

            <form action="" className='w-90 border'>
                <div>
                <Label htmlFor="username" value="Username" className='text-slate-200'></Label>
              <div> 
                
                <input type="text"
                className='bg-blue-400 border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500' />
                
                </div> 
                </div>
            </form>
             
              </div>

         
        </div>
  </div>
  )
}

export default Signup