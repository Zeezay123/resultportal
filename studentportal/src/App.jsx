import React from "react"
import {useState} from 'react'
import { BrowserRouter, Link, Route, Routes } from "react-router-dom"
import Dashboard from './pages/hod/Dashboard.jsx'


function App() {


  return (
   <BrowserRouter>
   <Routes>
     <Route path="/" element={<Dashboard/>} />

   </Routes>
   
   </BrowserRouter>
  )
}

export default App