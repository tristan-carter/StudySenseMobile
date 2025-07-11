import React, { useReducer, useContext, createContext, useCallback, useState, useRef } from 'react';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { fetchUserData, saveUserData, deleteAccount, fetchSharedSet, saveSetData, deleteSetData } from './service';

export const fetchUser = createAsyncThunk('user/fetchUser', async (_, { dispatch, rejectWithValue }) => {
    console.log("Fetching user data...")
    try {
        const userData = await dispatch(fetchUserData());
        return userData;
    } catch (error) {
        alert(error.message)
        throw error;
    }
});  

export const saveUser = createAsyncThunk('user/saveUser', async (data, { dispatch, getState, rejectWithValue }) => {
    console.log("Saving User Data...")
    if (data == "current") {
        const state = getState();
        data = state.user.data
    }
    if (data === undefined) {
        alert('Invalid data');
    }
    try {
        await dispatch(saveUserData(data));
    } catch (error) {
        alert(error.message);
        throw error;
    }
});

export const deleteAccountData = createAsyncThunk('user/deleteAccountData', async (userId, { dispatch, getState, rejectWithValue }) => {
    console.log("Deleting Account...")
    try {
        await dispatch(deleteAccount(userId));
    } catch (error) {
        alert(error.message);
        console.log("Error Deleting Account")
        console.log(error.message)
        throw error;
    }
});

export const saveSet = createAsyncThunk('user/saveSet', async (data, { dispatch, getState, rejectWithValue }) => {
  if (data == "current") {
      const state = getState();
      data = state.user.data
  }
  if (data === undefined) {
      alert('Invalid data');
  }
  try {
      await dispatch(saveSetData(data));
  } catch (error) {
      alert(error.message);
      throw error;
  }
});

export const deleteSetFromDatastore = createAsyncThunk('user/deleteSet', async (setId, { dispatch, getState, rejectWithValue }) => {
  try {
      await dispatch(deleteSetData(setId));
  } catch (error) {
      alert(error.message);
      console.log("Error Deleting Account")
      console.log(error.message)
      throw error;
  }
});

export const fetchSharedSetData = createAsyncThunk('user/fetchSharedSetData', async (setCode, { dispatch, getState, rejectWithValue }) => {
    console.log("Fetching Shared Set...")
    try {
        const sharedSetData = await dispatch(fetchSharedSet(setCode));
        console.log(sharedSetData)
        return sharedSetData;
    } catch (error) {
        alert(error.message);
        throw error;
    }
});

const userSlice = createSlice({
    name: 'user',
    initialState: {
        data: null,
        loading: false,
        error: null,
        currentFolder: null,
        currentSet: null,
        studySessionsTimeLeft: null,
        loggedIn: false,
        bottomNavShown: true,
        creatingNewSetFromNoSets: false,
    },
  reducers: {
    setBottomNavShown: (state, action) => {
      state.bottomNavShown = action.payload;
    },
    setCreatingNewSetFromNoSets: (state, action) => {
      state.creatingNewSetFromNoSets = action.payload;
    },
    setLoggedIn: (state, action) => {
      state.loggedIn = action.payload;
    },
    setUser: (state, action) => {
      state.data = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setCurrentFolder: (state, action) => {
      state.currentFolder = action.payload;
    },
    setCurrentSet: (state, action) => {
      state.currentSet = action.payload;
    },
    setCurrentSession: (state, action) => {
      state.data.currentSession = action.payload;
    },
    setStudySessionsTimeLeft: (state, action) => {
      state.studySessionsTimeLeft = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        console.log("Error fetching user data.")
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(saveUserData.pending, (state) => {
        //state.loading = true
      })
      .addCase(saveUserData.fulfilled, (state, action) => {
        if (action.payload != null) {
            state.data = action.payload;
            //state.loading = false;
        }
      })
      .addCase(saveUserData.rejected, (state, action) => {
        //state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, setBottomNavShown, setCreatingNewSetFromNoSets, setLoading, setError, setLoggedIn, setCurrentFolder, setCurrentSet, setCurrentSession, setStudySessionsTimeLeft } = userSlice.actions;
export default userSlice.reducer;