import { TextInput } from 'flowbite-react'
import React from 'react'
import Button from '../../ui/Button'
import { Upload } from 'lucide-react'

const UploadedResultTable = () => {
  return (
    <div className='flex flex-col mt-5 border shadow-sm rounded-lg p-4 border-slate-200'>
        
        <h1 className='font-semibold text-lg'>Uploaded Result</h1>
        
        {/* search and upload button */}
        <div className='flex justify-between items-center mt-4'> 
        <TextInput
        className='w-80'
        placeholder='Search by name or matric number'
        />     

        <Button icon={Upload} text="Upload" className='cursor-pointer' />   
       </div>

       <table className='mt-4'>
        <thead className='bg-slate-50 border-b w-full border-slate-200 mt-4'>
            <tr className='bg-blue-100 text-left text-gray-900 font-light text-sm '>
                <th className='text-left p-4'> S/N </th>
                <th className='text-left p-4'> MatricNumber </th>
                <th className='text-left p-4'> Name </th>
                <th className='text-left p-4'>Level</th>
                <th className='text-left p-4'>CA Score</th>
                <th className='text-left p-4'>Exam Score</th>
                <th className='text-left p-4'>Total Score</th>
                <th className='text-left p-4'>Grade</th>
                <th className='text-left p-4'>Remark</th>
                <th className='text-left p-4'>Update</th>
            </tr>
        </thead>
       </table>
        
        </div>
  )
}

export default UploadedResultTable