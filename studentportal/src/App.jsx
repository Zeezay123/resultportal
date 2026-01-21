import React from "react"
import {useState} from 'react'
import { BrowserRouter, Link, Route, Routes, Navigate } from "react-router-dom"
import { useSelector } from 'react-redux'

// Auth Pages
import Login from "./pages/auth/login.jsx"
import Layout from "./components/Layout/Layout.jsx"

// HOD Pages
import HodDashboard from './pages/hod/Dashboard.jsx'
import ApproveResults from './pages/hod/ApproveResults.jsx'
import AssignCourse from './pages/hod/AssignCourse.jsx'
import Lecturers from './pages/hod/Lecturers.jsx'

// Lecturer Pages
import LecturerDashboard from './pages/lecturer/Dashboard.jsx'

// Protected Routes
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import RoleRoute from './routes/RoleRoute.jsx'
import Signup from "./pages/auth/signup.jsx"
import Dashboard from "./pages/student/Dashboard.jsx"
import AssignToLecturer from "./pages/hod/AssignToLecturer.jsx"
import ResultsDashboard from "./pages/hod/ResultsDashboard.jsx"
import TestResults from "./components/Layout/hod/Results/TestResults.jsx"
import ExamResults from "./components/Layout/hod/Results/ExamResults.jsx"
import ReviewExamResult from "./components/Layout/hod/Results/ReviewExamResult.jsx"
import ReviewTestResult from "./components/Layout/hod/Results/ReviewTestResult.jsx"
import ReviewTestResults from "./pages/hod/ReviewTestResults.jsx"
import ReviewExamResults from "./pages/hod/ReviewExamResults.jsx"
import SubmitResults from "./pages/lecturer/SubmitResults.jsx"
import Courses from "./pages/lecturer/Courses.jsx"


function App() {
  return (
   <BrowserRouter>
   <Routes>
    {/* <Route path="/" element={<Signup/>} /> */}
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Default Route - Redirect based on role */}
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* HOD Routes - Only accessible by HOD */}
      <Route element={<RoleRoute allowedRoles={['Admin']} />}>
       <Route element={<Layout/>} > 
        <Route path="/hod/dashboard" element={<HodDashboard />} />
        <Route path="/hod/assign-course" element={<AssignCourse />} />
        <Route path="/hod/assign-course/lecturer" element={<AssignToLecturer />} />
        <Route path="/hod/results" element={<ResultsDashboard/>} />
        <Route path="/hod/lecturers" element={<Lecturers />} />
        <Route path="/hod/test-results" element={<ReviewTestResults/>} />
        <Route path="/hod/exam-results" element={<ReviewExamResults/>} />
        <Route path="/hod/review-exam-results" element={<ReviewExamResult/>} />
        <Route path="/hod/review-test-results" element={<ReviewTestResult/>} />
        </Route>
      </Route>

      {/* Lecturer Routes - Only accessible by Lecturer */}
      <Route element={<RoleRoute allowedRoles={['Lecturer']} />}>
      <Route element={<Layout/>} >
        <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
        <Route path="/lecturer/submit-results" element={<SubmitResults/>} />
        <Route path="/lecturer/courses" element={<Courses/>} />
        </Route>
      </Route>

      {/* Student Routes - Only accessible by Student */}
      <Route element={<RoleRoute allowedRoles={['Student']} />}>
      <Route element={<Layout/>} >
        <Route path="/student/dashboard" element={<Dashboard/>} />
        </Route>
      </Route>

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
   </Routes>
   
   </BrowserRouter>
  )
}

// Component to redirect based on user role
function RoleBasedRedirect() {
  const { role, isAuthenticated } = useSelector((state) => state.user);

  console.log('RoleBasedRedirect - isAuthenticated:', isAuthenticated, 'role:', role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const newRole = role.toLowerCase();
  

  // Redirect based on role
  switch(newRole) {
    case 'admin':
      return <Navigate to="/hod/dashboard" replace />;
    case 'lecturer':
      return <Navigate to="/lecturer/dashboard" replace />;
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    default:
      console.log('Unknown role:', role);
      return <Navigate to="/login" replace />;
  }
}

export default App