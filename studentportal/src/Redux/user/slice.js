import {createSlice} from '@reduxjs/toolkit';

// Initial state for the user slice
// This state will hold the current user, loading status, and any error messages
const initialState = {
    currentUser: null,
    error: null,
    loading: false,
}

// Create a slice for user-related actions and state
// This slice will handle user sign-in actions and manage the user state
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers:{
        signInStart:(state)=>{
            state.loading = true;
            state.error = null;
        },
        signInSuccess:(state, action)=>{
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
          },
         signInFailure:(state, action) => {
            state.loading = false;
            state.error = action.payload
         },
         updateStart:(state) => {
            state.loading = true;
            state.error = null;
         },

         updateSucess:(state, action) => {
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null; 
         },
         updateFaliure:(state, action)=>{
            state.loading = false;
            state.error = action.payload;
         },
         deleteUserStart:(state)=>{
            state.loading = false;
            state.error = null;

         },

         deleteUserSucess:(state)=>{
            state.loading = false;
            state.currentUser = null;
            state.error = null;     
            },

    deleteUserFailure:(state, action)=>{
        state.loading = false;
        state.error  = action.payload;
    },

    signOutSuccess:(state, action)=>{
        state.loading = false;
        state.currentUser = null;
        state.error = null;
    },
    signOutFailure:(state, action)=>{
        state.loading = false;
        state.error = action.payload;
    },
    signOutStart:(state)=>{
        state.loading= false;
        state.error = null
    }


         
    }
})

export const { 
    signInStart,
    signInSuccess,
    signInFailure,
    updateStart,
    updateFaliure,
    updateSucess,
    deleteUserStart,
    deleteUserFailure,
    deleteUserSucess, signOutSuccess} = userSlice.actions;
export default userSlice.reducer;