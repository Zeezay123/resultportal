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
} from 'lucide-react'









const sideBarData = { 
  logoItems : {
  main:"Delta State University", 
  sub: "Student Portal",
  image: logo,

},

mainItems : [
  
    {  
        title: 'Genaral',
        items:[
            {
        name:'Dashboard',
        tab:'',
        icon: LayoutDashboard,
        items:[
            
            
            {
                name: 'Overview',
                url: '',
                icon:UserCog,
            },

            {
                name:'Submissions',
                url:'',
                icon:Wrench,
            },

            {
              name: 'Approvals',
              url: '',
              icon: Palette,
            },
            {
              name: 'Notifications',
              url: '',
              icon: Bell,
            },
        
 
        ]
    }, 
    {
       
        name:'App',
        tab:'',
        icon: Package,
         items:[
            
        ]
    },
    {
        name:'Tasks',
        tab:'',
        icon: ListTodo,
         items:[
            
        ]
    }, 
     {
        name:'Chats',
        tab:'',
        icon: MessagesSquare,
        badge:3,
         items:[]
    },
     {
        name:'User',
        tab:'',
        icon: Users,
         items:[]
    }, 
       {
        name:'Secured by Clerk',
        tab:'',
        icon: ShieldCheck,
        items:[
            
        ]
   } 
]
 },
     
   
   {  
    
    title:'Pages',
        items:[
    {
        name:'Auth',
        tab:'',
        icon: Lock,
        items:[
            {
                name: 'Profile',
                url: '',
                icon:UserCog,
            },

            {
                name:'Account',
                url:'',
                icon:Wrench,
            },

            {
              name: 'Appearance',
              url: '',
              icon: Palette,
            },
            {
              name: 'Notifications',
              url: '',
              icon: Bell,
            },
        ]
    },

    {
        name:'Error',
        tab:'',
        icon: Bug,
        items:[]
    },
]
    },
     
    {

        title:"Settings",
        items: [
            {
        name:'Settings',
        tab:'',
        icon: Settings,
        items:[
            {
                name: 'Profile',
                url: '',
                icon:UserCog,
            },

            {
                name:'Account',
                url:'',
                icon:Wrench,
            },

            {
              name: 'Appearance',
              url: '',
              icon: Palette,
            },
            {
              name: 'Notifications',
              url: '',
              icon: Bell,
            },
        ]
    },{
        name:'Help Center',
        tab:'',
        icon: HelpCircle,
        items:[
            
        ]
    },
        ]
     
     },
    ],

bottomSide : {
  image: avatar,
//   image:'',
  username: 'ogajerrynorth',
  email:'north@gmail.com'
}

}

export default sideBarData;

