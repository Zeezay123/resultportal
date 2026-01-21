import React from 'react'
import logo from '../../assets/delsulogo.png'
import avatar from '../../assets/avatar.jpg'
import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  FileCheck,
  BookOpen,
  UserPlus,
  ClipboardList,
  GraduationCap,
  FileText,
  CheckCircle,
  Settings2,
} from 'lucide-react'

// HOD Sidebar Data
const hodSidebarData = { 
  logoItems : {
    main:"Delta State University", 
    sub: "HOD Portal",
    image: logo,
  },

  mainItems : [
    {  
      title: 'General',
      items:[
        {
          name:'Dashboard',
          url:'/hod/dashboard',
          icon: LayoutDashboard,
          items:[]
        }, 
         {
          name:'Courses',
          url:'/hod/assign-course',
          icon: BookOpen,
          items:[{
              name: 'Assign to Lecturer',
              url: '/hod/assign-course/lecturer',
              icon:UserCog,
            },
        {
              name: 'Type/Category',
              url: '/hod/assign-course/category',
              icon:Settings2,
            }]
        }, 
        {
          name:'Results',
          url:'/hod/results',
          icon: FileCheck,
          items:[{
              name: 'Test Results',
              url: '/hod/test-results',
              icon:UserCog,
            },
        {
              name: 'Exam Results',
              url: '/hod/exam-results',
              icon:Settings2,
            }]
        },
       
        {
          name:'Lecturers',
          url:'/hod/lecturers',
          icon: Users,
          items:[]
        }, 
        {
          name:'Students',
          url:'/hod/students',
          icon: GraduationCap,
          items:[]
        },
        {
          name:'Reports',
          url:'/hod/reports',
          icon: FileText,
          items:[]
        }
      ]
    },
    {
      title:"Settings",
      items: [
        {
          name:'Settings',
          url:'/hod/settings',
          icon: Settings,
          items:[
            {
              name: 'Profile',
              url: '/hod/settings/profile',
              icon:UserCog,
            },
            {
              name:'Account',
              url:'/hod/settings/account',
              icon:Wrench,
            },
            {
              name: 'Notifications',
              url: '/hod/settings/notifications',
              icon: Bell,
            },
          ]
        },
        {
          name:'Help Center',
          url:'/help',
          icon: HelpCircle,
          items:[]
        },
      ]
    },
  ],

  bottomSide : {
    image: avatar,
    username: 'HOD User',
    email:'hod@delsu.edu.ng'
  }
}

// Lecturer Sidebar Data
const lecturerSidebarData = { 
  logoItems : {
    main:"Delta State University", 
    sub: "Lecturer Portal",
    image: logo,
  },

  mainItems : [
    {  
      title: 'General',
      items:[
        {
          name:'Dashboard',
          url:'/lecturer/dashboard',
          icon: LayoutDashboard,
          items:[]
        }, 
         {
          name:'Submit Results',
          url:'/lecturer/submit-results',
          icon: ClipboardList,
          items:[]
        }, 
        {
          name:'My Courses',
          url:'/lecturer/courses',
          icon: BookOpen,
          items:[]
        },
       
        {
          name:'Students',
          url:'/lecturer/students',
          icon: GraduationCap,
          items:[]
        },
        {
          name:'Submissions',
          url:'/lecturer/submissions',
          icon: CheckCircle,
          items:[]
        }
      ]
    },
    {
      title:"Settings",
      items: [
        {
          name:'Settings',
          url:'/lecturer/settings',
          icon: Settings,
          items:[
            {
              name: 'Profile',
              url: '/lecturer/settings/profile',
              icon:UserCog,
            },
            {
              name:'Account',
              url:'/lecturer/settings/account',
              icon:Wrench,
            },
            {
              name: 'Notifications',
              url: '/lecturer/settings/notifications',
              icon: Bell,
            },
          ]
        },
        {
          name:'Help Center',
          url:'/help',
          icon: HelpCircle,
          items:[]
        },
      ]
    },
  ],

  bottomSide : {
    image: avatar,
    username: 'Lecturer User',
    email:'lecturer@delsu.edu.ng'
  }
}

// Student Sidebar Data
const studentSidebarData = { 
  logoItems : {
    main:"Delta State University", 
    sub: "Student Portal",
    image: logo,
  },

  mainItems : [
    {  
      title: 'General',
      items:[
        {
          name:'Dashboard',
          url:'/student/dashboard',
          icon: LayoutDashboard,
          items:[]
        }, 
        {
          name:'My Courses',
          url:'/student/courses',
          icon: BookOpen,
          items:[]
        },
        {
          name:'Results',
          url:'/student/results',
          icon: FileCheck,
          items:[]
        }, 
        {
          name:'Profile',
          url:'/student/profile',
          icon: UserCog,
          items:[]
        }
      ]
    },
    {
      title:"Settings",
      items: [
        {
          name:'Settings',
          url:'/student/settings',
          icon: Settings,
          items:[
            {
              name: 'Profile',
              url: '/student/settings/profile',
              icon:UserCog,
            },
            {
              name:'Account',
              url:'/student/settings/account',
              icon:Wrench,
            },
            {
              name: 'Notifications',
              url: '/student/settings/notifications',
              icon: Bell,
            },
          ]
        },
        {
          name:'Help Center',
          url:'/help',
          icon: HelpCircle,
          items:[]
        },
      ]
    },
  ],

  bottomSide : {
    image: avatar,
    username: 'Student User',
    email:'student@delsu.edu.ng'
  }
}

// Function to get sidebar data based on role
export const getSidebarDataByRole = (role) => {
  switch(role) {
    case 'Admin':
      return hodSidebarData;
    case 'Lecturer':
      return lecturerSidebarData;
    case 'Student':
      return studentSidebarData;
    default:
      return studentSidebarData; // Default to student
  }
}

// Default export for backwards compatibility
export default hodSidebarData;

